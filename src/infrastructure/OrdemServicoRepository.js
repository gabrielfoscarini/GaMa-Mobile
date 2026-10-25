import { OrdemServico, validarChecklist } from '../domain/OrdemServico.js';

export class OrdemServicoRepository {
  constructor(db) { this.db = db; }
  listar(busca = '', historico = false) {
    return this.db.getAllAsync(`SELECT * FROM ordens_servico
      WHERE (? = 0 OR status = 'Concluída')
      AND (instr(numero, ?) > 0 OR instr(upper(replace(placa,'-','')), ?) > 0)
      ORDER BY id DESC`, [historico ? 1 : 0, busca.trim(), busca.trim().toUpperCase().replace(/-/g, '')]);
  }
  async obter(id, tx = this.db) {
    const dados = await tx.getFirstAsync('SELECT * FROM ordens_servico WHERE id = ?', [id]);
    if (!dados) throw new Error('Ordem de serviço não encontrada.');
    const checklist = await tx.getAllAsync('SELECT * FROM checklist_itens WHERE ordem_servico_id = ? ORDER BY id', [id]);
    return { ...dados, checklist };
  }
  async iniciar(id) {
    await this.db.withExclusiveTransactionAsync(async tx => {
      new OrdemServico(await this.obter(id, tx)).validarInicio();
      await tx.runAsync("UPDATE ordens_servico SET status = 'Em andamento', data_inicio = ? WHERE id = ?", [new Date().toISOString(), id]);
    });
  }
  async salvar(id, dados, concluir = false) {
    await this.db.withExclusiveTransactionAsync(async tx => {
      const ordem = new OrdemServico(await this.obter(id, tx));
      ordem.validarEdicao();
      if (concluir) ordem.validarConclusao(dados);
      validarChecklist(dados.checklist);
      await tx.runAsync(`UPDATE ordens_servico SET diagnostico=?, servico_realizado=?,
        pecas_utilizadas=?, observacoes=?, status=?, data_conclusao=? WHERE id=?`,
        [dados.diagnostico.trim(), dados.servico_realizado.trim(), dados.pecas_utilizadas.trim(),
          dados.observacoes.trim(), concluir ? 'Concluída' : 'Em andamento', concluir ? new Date().toISOString() : null, id]);
      for (const item of dados.checklist) {
        await tx.runAsync('UPDATE checklist_itens SET situacao=? WHERE ordem_servico_id=? AND nome_item=?',
          [item.situacao, id, item.nome_item]);
      }
    });
  }
}
