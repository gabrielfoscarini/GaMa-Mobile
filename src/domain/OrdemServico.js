export const STATUS = { PENDENTE: 'Pendente', ANDAMENTO: 'Em andamento', CONCLUIDA: 'Concluída' };
export const ITENS = ['Pneus', 'Freios', 'Iluminação', 'Óleo', 'Bateria', 'Arrefecimento'];
export const SITUACOES = ['Conforme', 'Requer atenção', 'Não verificado'];

export class OrdemServico {
  constructor(dados) { Object.assign(this, dados); }
  validarInicio() {
    if (this.status !== STATUS.PENDENTE) throw new Error('Somente uma OS pendente pode ser iniciada.');
  }
  validarEdicao() {
    if (this.status !== STATUS.ANDAMENTO) throw new Error('Somente ordens em andamento podem ser alteradas.');
  }
  validarConclusao(dados) {
    this.validarEdicao();
    if (!dados.diagnostico?.trim() || !dados.servico_realizado?.trim()) {
      throw new Error('Preencha o diagnóstico e o serviço realizado para concluir.');
    }
  }
}

export function validarChecklist(itens) {
  if (!Array.isArray(itens) || itens.length !== ITENS.length ||
      ITENS.some(nome => itens.filter(i => i.nome_item === nome).length !== 1) ||
      itens.some(i => !SITUACOES.includes(i.situacao))) {
    throw new Error('Checklist inválido. Verifique os seis itens.');
  }
}
