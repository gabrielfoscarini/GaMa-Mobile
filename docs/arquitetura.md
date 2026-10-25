# Arquitetura e banco

O fluxo é Tela → caso de uso → repositório → SQLite. A entidade `OrdemServico` concentra as pré-condições de início, edição e conclusão. Os casos de uso são funções pequenas, sem injeção de dependência avançada: recebem o repositório. O repositório verifica o estado atual do banco dentro de uma transação antes de escrever. Não há entidades de Cliente ou Veículo porque o escopo só consulta os dados recebidos na OS fictícia.

`App.js` abre o banco uma vez e inicializa as tabelas. `presentation/navigation/AppNavigator.js` configura o native stack do React Navigation. A sessão é um estado React, sem tabela de usuários. As rotas de atendimento só existem após o login. Histórico e lista usam o mesmo componente com filtro. As telas chamam casos de uso e não executam SQL.

## Diagrama de classes

```mermaid
classDiagram
  class OrdemServico {
    +status
    +validarInicio()
    +validarEdicao()
    +validarConclusao(dados)
  }
  class CasosDeUso {
    +listarOrdens(repo, busca, historico)
    +obterOrdem(repo, id)
    +iniciarOrdem(repo, id)
    +salvarExecucao(repo, id, dados)
    +concluirOrdem(repo, id, dados)
  }
  class OrdemServicoRepository {
    +db
    +listar(busca, historico)
    +obter(id)
    +iniciar(id)
    +salvar(id, dados, concluir)
  }
  class Telas
  class SQLite
  Telas ..> CasosDeUso : chama
  CasosDeUso ..> OrdemServicoRepository : utiliza
  OrdemServicoRepository ..> OrdemServico : valida
  OrdemServicoRepository --> SQLite : persiste
```

`CasosDeUso` representa o módulo de funções, não uma classe implementada. `Telas` agrupa os componentes React e `SQLite` representa a biblioteca.

## DER

```mermaid
erDiagram
  ordens_servico ||--|{ checklist_itens : possui
  ordens_servico {
    INTEGER id PK
    TEXT numero UK
    TEXT cliente
    TEXT veiculo
    TEXT placa
    INTEGER quilometragem
    TEXT reclamacao
    TEXT servico_solicitado
    TEXT tecnico
    TEXT diagnostico
    TEXT servico_realizado
    TEXT pecas_utilizadas
    TEXT observacoes
    TEXT status
    TEXT data_abertura
    TEXT data_inicio
    TEXT data_conclusao
  }
  checklist_itens {
    INTEGER id PK
    INTEGER ordem_servico_id FK
    TEXT nome_item
    TEXT situacao
  }
```

Há exatamente duas tabelas de aplicação. A chave estrangeira é habilitada na conexão. A combinação ordem/item é única e os estados possuem restrições CHECK. Os seis itens são criados junto da OS na transação inicial. Início e conclusão podem ser nulos enquanto ainda não ocorreram. Textos de execução vazios permitem registros parciais. A busca usa parâmetros SQL, inclusive para textos com aspas. Gravações de OS e checklist são atômicas: uma falha causa rollback.

O banco `gama-tecnico.db` é criado no diretório padrão do Expo SQLite. Reinicialização não duplica exemplos. Não há migrações adicionais porque esta é a primeira versão do esquema. Fontes técnicas: [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) e [React Navigation](https://reactnavigation.org/docs/getting-started/).
