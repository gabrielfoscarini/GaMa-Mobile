export const listarOrdens = (repositorio, busca, historico) => repositorio.listar(busca, historico);
export const obterOrdem = (repositorio, id) => repositorio.obter(id);
export const iniciarOrdem = (repositorio, id) => repositorio.iniciar(id);
export const salvarExecucao = (repositorio, id, dados) => repositorio.salvar(id, dados);
export const concluirOrdem = (repositorio, id, dados) => repositorio.salvar(id, dados, true);
export const autenticar = (usuario, senha) => usuario.trim() === 'mecanico' && senha === '1234';
