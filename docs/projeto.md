# Projeto acadêmico — GaMa Mobile

## Identificação

- Classificação: **J — Implementação de Software**.
- Curso: Análise e Desenvolvimento de Sistemas.
- Integrantes: Gabriel Foscarini (RA 60008405) e Matheus Mendes (RA 6000105), 4º período.
- Instituição e disciplina: Unipar Toledo, Extensão IV (código 6152313).
- Público efetivamente atendido: um mecânico da Mecânica do Paulinho testou o fluxo do aplicativo.
- Evidências do aplicativo: capturas do emulador no documento ACEx.

O aplicativo usa dados de demonstração no banco local. O teste de uso informado ocorreu na Mecânica do Paulinho; não houve implantação, integração com ERP ou medição de ganho de produtividade.

## Visão geral e objetivo

O GaMa Mobile demonstra o fluxo de execução de uma ordem de serviço em oficina: consulta, início, inspeção, registro e conclusão. Seu objetivo é aplicar desenvolvimento mobile, persistência local e regras de negócio em um projeto pequeno e explicável. No cenário conceitual, um ERP mantém os cadastros; neste protótipo, não há conexão com ele. O banco recebe exemplos automaticamente.

## Escopo

Quatro telas, login local, pesquisa por número/placa, consulta de dados, início com horário, registros textuais, checklist com seis itens, salvamento parcial, conclusão confirmada e histórico somente para consulta. Não inclui cadastro de clientes/veículos/OS, recuperação de senha, serviços online, estoque, orçamento, financeiro ou emissão fiscal.

## Requisitos funcionais

| ID | Requisito |
|---|---|
| RF01 | Validar mecanico/1234 localmente, apresentar erro e mostrar/ocultar senha. |
| RF02 | Permitir sair da sessão sem apagar dados salvos. |
| RF03 | Listar cards com número, cliente, veículo, placa, serviço e situação. |
| RF04 | Pesquisar por número ou placa na lista e no histórico. |
| RF05 | Consultar todos os dados da OS, incluindo quilometragem, reclamação, técnico e datas. |
| RF06 | Iniciar pendente, registrar data/hora e alterar para Em andamento. |
| RF07 | Registrar e salvar diagnóstico, serviço, peças e observações. |
| RF08 | Preencher Pneus, Freios, Iluminação, Óleo, Bateria e Arrefecimento. |
| RF09 | Exigir diagnóstico/serviço, confirmar conclusão e registrar data/hora. |
| RF10 | Exibir somente concluídas no histórico e abri-las em modo consulta. |
| RF11 | Criar duas tabelas e inserir oito ordens de demonstração sem duplicá-las. |

## Requisitos não funcionais

- RNF01: React Native, Expo, JavaScript, Expo SQLite e React Navigation; sem backend.
- RNF02: Persistência local entre sessões, transações na criação e alteração.
- RNF03: Orientação vertical, rolagem, campos rotulados, botões grandes e situações identificadas por texto e cor.
- RNF04: Organização DDD simplificada em quatro camadas, sem abstrações avançadas.
- RNF05: Sem dados reais, comunicação ERP ou serviços pagos.
- RNF06: Execução documentada no Android Emulator e dependências fixadas no lockfile.

## Regras de negócio

1. Cliente, veículo, placa, quilometragem, reclamação e serviço solicitado são somente consultados.
2. Apenas uma ordem com estado Pendente pode ser iniciada. Isso é uma condição de estado por OS; não impõe limite global de atendimentos simultâneos.
3. Apenas ordens Em andamento permitem edição dos registros e do checklist.
4. Todos os seis itens começam Não verificado. Cada um aceita Conforme, Requer atenção ou Não verificado.
5. Diagnóstico e serviço realizado precisam conter texto além de espaços para concluir.
6. Checklist não verificado não impede conclusão, pois o requisito não exige todos os itens verificados.
7. Cancelar a confirmação mantém o formulário e não conclui nem salva por esse botão.
8. Concluir salva os campos/checklist e data/hora na mesma transação.
9. Concluídas são imutáveis pela interface e pelo repositório do aplicativo.
10. Datas usam o relógio do aparelho, são guardadas em ISO e exibidas em pt-BR no fuso local.
11. Sair não apaga registros; dados não salvos só existem no formulário.
