# Roteiro de testes

Execute `npm test` para regras e SQL. Execute `npm run check` e `npm run export` para compatibilidade e bundle Android. Os testes automatizados não substituem interação com os componentes nativos.

## Teste manual no Android

Comece com dados restaurados num emulador dedicado. Registre resultado real, data, dispositivo e evidência; não marque como aprovado sem executar.

| Caso | Ação | Resultado esperado | Resultado real |
|---|---|---|---|
| T01 | Abrir pela primeira vez | 8 OS: 6 pendentes, 1 em andamento e 1 concluída | [PREENCHER] |
| T02 | Digitar login incorreto ou vazio | Erro e permanência no login | [PREENCHER] |
| T03 | Mostrar/ocultar senha e entrar com mecanico/1234 | Alternância da senha e acesso à lista | [PREENCHER] |
| T04 | Buscar 1001 e fic1a01 | Apenas a OS correspondente; busca sem diferenciar caixa na placa | [PREENCHER] |
| T05 | Buscar placa inexistente, depois limpar busca | Estado vazio, depois lista completa | [PREENCHER] |
| T06 | Abrir pendente | Todos os dados consultáveis, execução não editável | [PREENCHER] |
| T07 | Iniciar pendente | Em andamento, data/hora preenchida, botão iniciar desaparece | [PREENCHER] |
| T08 | Alterar texto, checklist e salvar; voltar e reabrir | Conteúdo preservado | [PREENCHER] |
| T09 | Concluir sem diagnóstico ou serviço, inclusive só espaços | Erro, sem conclusão | [PREENCHER] |
| T10 | Preencher campos obrigatórios e cancelar confirmação | Permanece Em andamento | [PREENCHER] |
| T11 | Confirmar conclusão | Campos salvos, Concluída, data/hora registrada | [PREENCHER] |
| T12 | Abrir histórico, pesquisar e abrir concluída | Somente concluídas, detalhes sem controles de edição | [PREENCHER] |
| T13 | Sair, pressionar voltar no Android | Não retorna à área autenticada | [PREENCHER] |
| T14 | Fechar/reabrir o aplicativo e entrar | Dados salvos persistem, sem duplicação de OS | [PREENCHER] |
| T15 | Editar sem salvar e pressionar voltar | Opções para continuar ou descartar | [PREENCHER] |
| T16 | Abrir teclado, rolar e testar fonte maior | Campos/botões acessíveis, sem sobreposição impeditiva | [PREENCHER] |
| T17 | Trocar cada item entre os três valores e salvar | Valores persistem corretamente | [PREENCHER] |
| T18 | Limpar armazenamento conforme README | Oito exemplos originais recriados | [PREENCHER] |

Dispositivo/Android: [PREENCHER]. Responsável: [PREENCHER]. Data: [PREENCHER]. Falhas encontradas e correções: [PREENCHER].
