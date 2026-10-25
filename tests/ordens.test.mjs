import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { inicializarBanco } from '../src/infrastructure/database.js';
import { OrdemServicoRepository } from '../src/infrastructure/OrdemServicoRepository.js';
import { autenticar, listarOrdens, iniciarOrdem, concluirOrdem, salvarExecucao } from '../src/application/ordens.js';

// O mesmo SQL do aplicativo roda no SQLite real; só a interface assíncrona é adaptada.
function bancoTeste() {
  const sqlite = new DatabaseSync(':memory:');
  const db = {
    execAsync: async sql => sqlite.exec(sql),
    getFirstAsync: async (sql, params = []) => sqlite.prepare(sql).get(...params),
    getAllAsync: async (sql, params = []) => sqlite.prepare(sql).all(...params),
    runAsync: async (sql, params = []) => {
      const result = sqlite.prepare(sql).run(...params);
      return { changes: result.changes, lastInsertRowId: Number(result.lastInsertRowid) };
    },
    withExclusiveTransactionAsync: async fn => {
      sqlite.exec('BEGIN');
      try { await fn(db); sqlite.exec('COMMIT'); }
      catch (error) { sqlite.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, sqlite };
}
async function fixture(t) {
  const { db, sqlite } = bancoTeste();
  t.after(() => sqlite.close());
  await inicializarBanco(db);
  return { db, repo: new OrdemServicoRepository(db) };
}
test('login aceita apenas credenciais locais', () => {
  assert.equal(autenticar('mecanico', '1234'), true);
  assert.equal(autenticar('mecanico', '0000'), false);
  assert.equal(autenticar('tecnico', '1234'), false);
  assert.equal(autenticar('outro', '1234'), false);
});
test('cria somente duas tabelas, oito OS e 48 itens sem duplicar', async t => {
  const { db, repo } = await fixture(t);
  await inicializarBanco(db);
  assert.equal((await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table'")).length, 2);
  const ordens = await repo.listar();
  assert.equal(ordens.length, 8);
  assert.equal(ordens.filter(o => o.status === 'Pendente').length, 6);
  assert.equal(ordens.filter(o => o.status === 'Em andamento').length, 1);
  assert.equal(ordens.filter(o => o.status === 'Concluída').length, 1);
  const itens = await db.getAllAsync('SELECT * FROM checklist_itens');
  assert.equal(itens.length, 48);
  assert.ok(itens.every(i => i.situacao === 'Não verificado'));
});

test('adiciona três pendentes no banco antigo e preserva execução após reinicializar', async t => {
  const { db, repo } = await fixture(t);
  await db.runAsync('DELETE FROM checklist_itens WHERE ordem_servico_id IN (SELECT id FROM ordens_servico WHERE numero IN (?,?,?))', ['1006', '1007', '1008']);
  await db.runAsync('DELETE FROM ordens_servico WHERE numero IN (?,?,?)', ['1006', '1007', '1008']);
  await iniciarOrdem(repo, 1);
  const original = await repo.obter(1);
  await inicializarBanco(db);
  assert.deepEqual(await repo.obter(1), original);
  const novas = (await repo.listar()).filter(o => ['1006', '1007', '1008'].includes(o.numero));
  assert.equal(novas.length, 3);
  assert.ok(novas.every(o => o.status === 'Pendente' && !o.data_inicio && !o.data_conclusao));
  for (const ordem of novas) {
    const detalhes = await repo.obter(ordem.id);
    assert.equal(detalhes.checklist.length, 6);
    assert.ok(detalhes.checklist.every(i => i.situacao === 'Não verificado'));
  }
  await iniciarOrdem(repo, novas[0].id);
  const iniciada = await repo.obter(novas[0].id);
  await inicializarBanco(db);
  assert.equal((await repo.listar()).length, 8);
  assert.deepEqual(await repo.obter(novas[0].id), iniciada);
});
test('pesquisa por número, placa normalizada, sem resultados e histórico', async t => {
  const { repo } = await fixture(t);
  assert.equal((await listarOrdens(repo, '1001')).length, 1);
  assert.equal((await listarOrdens(repo, 'fic-1a01')).length, 1);
  assert.equal((await listarOrdens(repo, 'inexistente')).length, 0);
  assert.equal((await listarOrdens(repo, "' OR 1=1 --")).length, 0);
  assert.equal((await listarOrdens(repo, '', true)).length, 1);
  assert.equal((await listarOrdens(repo, '1001', true)).length, 0);
});
test('início exige pendente e registra horário', async t => {
  const { repo } = await fixture(t);
  await iniciarOrdem(repo, 1);
  const ordem = await repo.obter(1);
  assert.equal(ordem.status, 'Em andamento');
  assert.ok(Number.isFinite(Date.parse(ordem.data_inicio)));
  await assert.rejects(() => iniciarOrdem(repo, 1), /pendente/);
  await assert.rejects(() => iniciarOrdem(repo, 5), /pendente/);
});
test('salva parcial, conclui e impede qualquer alteração posterior', async t => {
  const { repo, db } = await fixture(t);
  await iniciarOrdem(repo, 1);
  const dados = await repo.obter(1);
  dados.diagnostico = '  Desgaste nas pastilhas  ';
  dados.checklist[1].situacao = 'Requer atenção';
  await salvarExecucao(repo, 1, dados);
  const reaberto = await new OrdemServicoRepository(db).obter(1);
  assert.equal(reaberto.diagnostico, 'Desgaste nas pastilhas');
  assert.equal(reaberto.checklist[1].situacao, 'Requer atenção');
  await assert.rejects(() => concluirOrdem(repo, 1, dados), /diagnóstico/);
  dados.servico_realizado = 'Substituição das pastilhas';
  await concluirOrdem(repo, 1, dados);
  const final = await repo.obter(1);
  assert.equal(final.status, 'Concluída');
  assert.ok(Date.parse(final.data_conclusao) >= Date.parse(final.data_inicio));
  await assert.rejects(() => salvarExecucao(repo, 1, dados), /andamento/);
  await assert.rejects(() => concluirOrdem(repo, 1, dados), /andamento/);
  assert.deepEqual(await repo.obter(1), final);
});
test('campos em branco, OS pendente, checklist inválido e ID inexistente são rejeitados', async t => {
  const { repo } = await fixture(t);
  const pendente = await repo.obter(1);
  await assert.rejects(() => salvarExecucao(repo, 1, pendente), /andamento/);
  const ordem = await repo.obter(4);
  await assert.rejects(() => concluirOrdem(repo, 4, { ...ordem, diagnostico: '  ', servico_realizado: 'Teste' }), /diagnóstico/);
  await assert.rejects(() => salvarExecucao(repo, 4, { ...ordem, checklist: [] }), /Checklist/);
  assert.deepEqual(await repo.obter(4), ordem);
  await assert.rejects(() => repo.obter(999), /não encontrada/);
});
