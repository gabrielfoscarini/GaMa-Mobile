# GaMa Mobile

Aplicativo acadêmico Android para consultar e executar ordens de serviço fictícias de uma oficina. Classificação: **J — Implementação de Software**. Não há comunicação com ERP ou serviços externos de dados.

## Tecnologias

JavaScript, React Native, Expo SDK 57, Expo SQLite e React Navigation (native stack). As dependências `react-native-screens` e `react-native-safe-area-context` dão suporte à navegação e às áreas seguras da tela. Não utiliza TypeScript, API, servidor de aplicação ou serviços pagos.

## Instalar e executar

Instale Node.js 24 LTS com npm. Abra um terminal nesta pasta:

```powershell
npm ci
npm start
```

As dependências já foram instaladas neste ambiente. Se aqui o comando `npm` não for reconhecido, instale o Node.js com npm e reabra o terminal. Enquanto isso, com o `node` disponível e `node_modules` instalado, também é possível iniciar com:

```powershell
node node_modules/expo/bin/cli start
```

No celular Android, abra o projeto no Expo Go compatível com SDK 57 pelo QR code. O computador e o aparelho devem conseguir se comunicar na rede local. O Metro serve apenas o código durante o desenvolvimento: os dados do aplicativo ficam no SQLite do aparelho e não são enviados ao computador ou a um ERP. Uma distribuição Android independente exigiria uma compilação nativa; não foi gerado APK.

**Login:** usuário `mecanico`, senha `1234`. Não há cadastro ou recuperação. A sessão é mantida apenas na memória; ao reiniciar o app, faça login novamente. O botão Sair fica na lista principal e preserva os registros salvos.

## Android Emulator

1. Instale Android Studio e, no SDK Manager, Android Emulator, Android SDK Platform-Tools e uma imagem de sistema Android.
2. Configure `ANDROID_HOME` para a pasta do SDK e acrescente `platform-tools` e `emulator` ao PATH. No Windows, a pasta usual é `%LOCALAPPDATA%\Android\Sdk`.
3. Abra Device Manager, crie um dispositivo virtual de telefone e inicie-o no botão Play.
4. Confira se `adb devices` mostra o dispositivo.
5. Nesta pasta, execute `npm run android` ou `node node_modules/expo/bin/cli start --android`. Também pode usar `npm start` e pressionar `a`.
6. Aguarde a abertura do Expo Go e do aplicativo. Mantenha o emulador na vertical.

Referência: [configuração oficial do emulador no Expo](https://docs.expo.dev/workflow/android-studio-emulator/).

## Uso

A primeira abertura cria oito OS de demonstração: seis pendentes, uma em andamento e uma concluída. Cada uma recebe seis itens de checklist como Não verificado. Pesquise por número ou placa, abra uma pendente e toque em Iniciar atendimento. Preencha os registros e o checklist. Salvar registro permite guardar trabalho parcial. Concluir OS exige diagnóstico e serviço realizado e abre uma confirmação. Após concluir, a ordem aparece no histórico e não admite alterações.

Alterações no formulário precisam ser salvas; a navegação de volta avisa antes de descartá-las. Fechar à força o aplicativo pode perder texto ainda não salvo. Cliente, veículo e dados de origem não são editáveis.

## Restaurar os dados fictícios

Para reiniciar a demonstração, no Android acesse **Configurações > Aplicativos > Expo Go > Armazenamento > Limpar armazenamento/dados** e reabra o projeto. Isso apaga também os dados de outros projetos armazenados nesse Expo Go; use um emulador dedicado à apresentação. Em uma eventual instalação nativa, limpe os dados somente de GaMa Mobile. As oito ordens são recriadas na próxima abertura. Recarregar o JavaScript, sair do login ou reiniciar Metro não restaura o banco.

## Estrutura

```text
App.js                          Inicialização do banco e sessão local
src/domain/                     Entidade e regras de negócio
src/application/                Casos de uso e validação do login local
src/infrastructure/             Criação, carga inicial e repositório SQLite
src/presentation/screens/       Login, ordens/histórico e execução
src/presentation/components/    Campos, botões, badges e estilos
src/presentation/navigation/    Navegação das quatro telas
tests/                          Testes de regras e SQL real
docs/                           Documentação acadêmica e roteiros
```

Histórico reutiliza o componente de listagem com filtro, mas é uma rota própria. São quatro telas: Login, Ordens, Detalhes e Histórico.

## Verificações

```powershell
npm test
npm run check
npm run export
```

Os testes usam `node:sqlite` do Node 24, sem adicionar biblioteca ao aplicativo. Executam o SQL real através de um adaptador da interface Expo. A exportação valida o bundle Android, mas não produz APK e não substitui execução no dispositivo. Veja `docs/testes.md` para a matriz manual e `docs/verificacao.md` para os resultados desta implementação.

## Gravar a apresentação pelo computador

Com o emulador aberto, use **Extended controls (…) > Record and Playback > Start recording**, demonstre o fluxo, pare e salve. Consulte o [guia oficial de gravação do Android Emulator](https://developer.android.com/studio/run/emulator-record-screen). Para uma apresentação narrada, capture a janela do emulador e o microfone com um gravador de tela do computador. Siga o roteiro de até três minutos em `docs/apresentacao.md` e confira a lista de prints antes de entregar a ACEx.

## Limitações

Protótipo didático com credenciais fixas e banco local não criptografado; não é um sistema de autenticação de produção. Não sincroniza entre aparelhos. Não inclui cadastros, estoque, orçamento, financeiro, emissão fiscal, anexos, API ou integração ERP. Dados e placas são fictícios. Remover o armazenamento apaga os registros. O desenvolvimento usa Metro; o funcionamento de um APK sem Metro não foi validado. O alvo é Android, sem versão web.

## Documentação

- [Visão geral, objetivo, escopo e requisitos](docs/projeto.md)
- [Arquitetura, diagrama de classes e DER](docs/arquitetura.md)
- [Roteiro de testes](docs/testes.md)
- [Roteiro do vídeo e prints da ACEx](docs/apresentacao.md)
- [Verificações executadas](docs/verificacao.md)
