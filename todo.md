# Bitbaby Login - TODO

## Fluxo de Verificação
- [x] Corrigir polling no Home.tsx para usar tRPC em vez de fetch direto
- [x] Garantir que requestEmailCode atualiza status corretamente no banco
- [x] Garantir que cliente redireciona para /verify-email quando admin clica Email
- [x] Garantir que cliente redireciona para /verification quando admin clica 2FA
- [x] Testar fluxo completo end-to-end

## Validação de Códigos
- [ ] Adicionar validação de 6 dígitos no VerifyEmail
- [ ] Adicionar validação de 6 dígitos no Verification
- [ ] Cliente envia código → aparece no painel admin
- [ ] Admin aprova/rejeita código
- [ ] Cliente continua para próxima etapa após aprovação

## Dashboard
- [ ] Criar página Dashboard para cliente após verificação completa
- [ ] Implementar logout
- [ ] Mostrar histórico de logins


## Novas Tarefas (Prioridade Alta)
- [x] 1. Investigar e corrigir bug do botão Reject Login
- [x] 2. Implementar contador de cliques em tempo real no painel admin
- [x] 3. Adicionar botão para limpar todos os dados do painel
- [x] 4. Traduzir todo o site para inglês

## Contador Geral de Page Views (Implementado)
- [x] Criar tabela pageViewStats com campos id, pageType, viewCount, createdAt, updatedAt
- [x] Remover coluna pageViewCount da tabela clientLoginData
- [x] Implementar função incrementGlobalPageView() no servidor
- [x] Implementar função getGlobalPageViewCount() no servidor
- [x] Adicionar mutation incrementLoginPageView no tRPC router
- [x] Adicionar query getGlobalPageViewCount no tRPC router
- [x] Atualizar Home.tsx para chamar incrementLoginPageView ao carregar
- [x] Remover coluna "Views" da tabela no AdminDashboard
- [x] Adicionar exibição de "Total Page Views" no header do AdminDashboard
- [x] Implementar polling automático a cada 2 segundos para atualizar contador
- [x] Criar testes unitários para funções de contador global
- [x] Todos os 26 testes passando

## Bug Report - Reject Login Button
- [x] Botão "Reject Login" só funciona na primeira vez, depois não responde mais
- [x] Investigar se o problema está na criação/atualização de sessão
- [x] Verificar se há erro de duplicação de sessionId
- [x] Testar múltiplas rejeições consecutivas

### Correções Aplicadas:
1. Mudado handleRejectCode para usar mutateAsync em vez de mutate
2. Adicionado refetch() após rejeição para atualizar UI
3. Adicionado await na chamada de handleRejectCode no botão
4. Adicionado logging detalhado para debugar problemas futuros
5. **CORREÇÃO FINAL**: Sempre criar uma NOVA sessão ao rejeitar (em vez de reutilizar a antiga)
6. Adicionado melhor tratamento de erro com alert para o usuário
7. Validado que sessionId existe antes de chamar handleRejectCode


## Nova Feature - Verificação SMS (FLUXO COMPLETO)
- [x] Adicionar campo smsCode à tabela verificationSessions
- [x] Criar página VerifySMS.tsx para cliente inserir código SMS
- [x] Adicionar botão SMS no painel admin
- [x] Implementar mutation requestSmsCode (apenas muda status)
- [x] Implementar mutation submitSmsCode (cliente envia código)
- [x] Exibir código SMS enviado pelo cliente no painel admin
- [x] Implementar mutation approveSmsCode no tRPC
- [x] Implementar mutation rejectSmsCode no tRPC
- [x] Adicionar redirecionamento do cliente para /verify-sms
- [x] Exibir códigos (Email, 2FA, SMS) no painel admin
- [x] Todos os 26 testes passando


## Nova Feature - Contador de Cliques e Limpeza de Dados
- [x] Adicionar rastreamento de cliques no link principal (não apenas page views)
- [x] Criar mutation para incrementar contador de cliques
- [x] Criar botão "Pagar Informações" no painel admin (já existia como "Clear All Data")
- [x] Implementar limpeza completa de dados (clientes, sessões, contadores)
- [x] Exibir contador de cliques no painel admin
- [x] Testar fluxo completo
- [x] Todos os 26 testes passando


## Nova Feature - Monitoramento de Status Online/Offline
- [x] Adicionar campos lastActivityAt e isOnline ao clientLoginData
- [x] Implementar heartbeat do cliente a cada 30 segundos
- [x] Criar mutation updateClientActivity para atualizar status
- [x] Criar mutation markClientOffline para marcar offline
- [x] Exibir indicador de status (verde/cinza) no painel admin
- [x] Adicionar coluna "Online" na tabela de clientes
- [x] Testar fluxo completo
- [x] Todos os 26 testes passando
