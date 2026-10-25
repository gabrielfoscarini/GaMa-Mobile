import { ITENS } from '../domain/OrdemServico.js';

export const SCHEMA = `
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS ordens_servico (
 id INTEGER PRIMARY KEY, numero TEXT NOT NULL UNIQUE, cliente TEXT NOT NULL,
 veiculo TEXT NOT NULL, placa TEXT NOT NULL, quilometragem INTEGER NOT NULL,
 reclamacao TEXT NOT NULL, servico_solicitado TEXT NOT NULL, tecnico TEXT NOT NULL,
 diagnostico TEXT NOT NULL DEFAULT '', servico_realizado TEXT NOT NULL DEFAULT '',
 pecas_utilizadas TEXT NOT NULL DEFAULT '', observacoes TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL CHECK(status IN ('Pendente','Em andamento','Concluída')),
 data_abertura TEXT NOT NULL, data_inicio TEXT, data_conclusao TEXT
);
CREATE TABLE IF NOT EXISTS checklist_itens (
 id INTEGER PRIMARY KEY, ordem_servico_id INTEGER NOT NULL REFERENCES ordens_servico(id),
 nome_item TEXT NOT NULL, situacao TEXT NOT NULL DEFAULT 'Não verificado'
 CHECK(situacao IN ('Conforme','Requer atenção','Não verificado')),
 UNIQUE(ordem_servico_id, nome_item)
);`;

export async function inicializarBanco(db) {
  await db.execAsync(SCHEMA);
  await db.withExclusiveTransactionAsync(async tx => {
    const existente = await tx.getFirstAsync('SELECT COUNT(*) AS total FROM ordens_servico');
    if (existente.total) return;
    const exemplos = [
      ['Cliente Fictício A', 'Hatch demonstração', 'FIC1A01', 42000, 'Ruído ao frear', 'Inspeção dos freios', 'Pendente'],
      ['Cliente Fictício B', 'Sedã demonstração', 'FIC2B02', 68000, 'Revisão periódica', 'Troca de óleo e inspeção', 'Pendente'],
      ['Cliente Fictício C', 'Utilitário demonstração', 'FIC3C03', 91000, 'Farol não acende', 'Verificação da iluminação', 'Pendente'],
      ['Cliente Fictício D', 'Compacto demonstração', 'FIC4D04', 35000, 'Dificuldade na partida', 'Inspeção da bateria', 'Em andamento'],
      ['Cliente Fictício E', 'SUV demonstração', 'FIC5E05', 54000, 'Temperatura elevada', 'Inspeção do arrefecimento', 'Concluída'],
    ];
    const agora = Date.now();
    for (const [indice, exemplo] of exemplos.entries()) {
      const concluida = exemplo[6] === 'Concluída';
      const inicio = exemplo[6] === 'Pendente' ? null : new Date(agora - 3600000).toISOString();
      const resultado = await tx.runAsync(`INSERT INTO ordens_servico
        (numero,cliente,veiculo,placa,quilometragem,reclamacao,servico_solicitado,status,
        tecnico,data_abertura,data_inicio,data_conclusao,diagnostico,servico_realizado)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [`100${indice + 1}`, ...exemplo, 'Mecânico de demonstração', new Date(agora - 86400000).toISOString(), inicio,
          concluida ? new Date(agora - 1800000).toISOString() : null,
          concluida ? 'Nível de fluido abaixo do recomendado (exemplo fictício).' : '',
          concluida ? 'Inspeção do sistema e correção do nível (exemplo fictício).' : '']);
      for (const nome of ITENS) {
        await tx.runAsync('INSERT INTO checklist_itens (ordem_servico_id,nome_item,situacao) VALUES (?,?,?)',
          [resultado.lastInsertRowId, nome, 'Não verificado']);
      }
    }
  });
  // Complementa também bancos já usados, sem substituir registros existentes.
  await db.withExclusiveTransactionAsync(async tx => {
    const novasOrdens = [
      ['1006', 'Cliente Fictício F', 'Hatch demonstração', 'FIC6F06', 48000, 'Vibração ao dirigir', 'Inspeção dos pneus'],
      ['1007', 'Cliente Fictício G', 'Sedã demonstração', 'FIC7G07', 72000, 'Ruído na suspensão', 'Inspeção da suspensão'],
      ['1008', 'Cliente Fictício H', 'Utilitário demonstração', 'FIC8H08', 59000, 'Partida lenta pela manhã', 'Verificação da bateria'],
    ];
    for (const dados of novasOrdens) {
      const existente = await tx.getFirstAsync('SELECT id FROM ordens_servico WHERE numero = ?', [dados[0]]);
      if (existente) continue;
      const resultado = await tx.runAsync(`INSERT INTO ordens_servico
        (numero,cliente,veiculo,placa,quilometragem,reclamacao,servico_solicitado,tecnico,status,data_abertura)
        VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [...dados, 'Mecânico de demonstração', 'Pendente', new Date().toISOString()]);
      for (const nome of ITENS) {
        await tx.runAsync('INSERT INTO checklist_itens (ordem_servico_id,nome_item,situacao) VALUES (?,?,?)',
          [resultado.lastInsertRowId, nome, 'Não verificado']);
      }
    }
    await tx.runAsync("UPDATE ordens_servico SET tecnico = 'Mecânico de demonstração' WHERE tecnico = 'Técnico de demonstração'");
  });
}
