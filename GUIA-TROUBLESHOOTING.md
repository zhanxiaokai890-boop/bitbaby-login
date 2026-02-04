# 🆘 Guia de Troubleshooting e FAQ

Este guia ajuda a resolver problemas comuns ao fazer deploy na Vercel e PlanetScale.

## 🔴 Problemas Comuns

### Problema 1: "Build failed" na Vercel

**Sintomas:**
- Deployment falha
- Você vê "Build failed" em vermelho
- Logs mostram erros

**Soluções:**

1. **Verificar logs detalhados:**
   - Vá para seu projeto no Vercel
   - Clique em **"Deployments"**
   - Clique no deployment que falhou
   - Clique em **"Logs"** para ver o erro

2. **Erro comum: "Cannot find module"**
   ```
   Solução: Reinstale dependências
   git push origin main (força novo build)
   ```

3. **Erro comum: "TypeScript error"**
   ```
   Solução: Verifique o arquivo com erro
   pnpm check (localmente)
   Corrija o erro e faça push novamente
   ```

4. **Erro comum: "Build timeout"**
   ```
   Solução: Seu build está demorando muito
   - Otimize o código
   - Remova dependências desnecessárias
   - Tente novamente
   ```

---

### Problema 2: "Cannot connect to database"

**Sintomas:**
- Seu site abre, mas mostra erro de banco de dados
- Logs mostram: "Connection refused" ou "Access denied"

**Soluções:**

1. **Verificar DATABASE_URL:**
   ```bash
   # Localmente, teste a conexão
   mysql -u usuario -psenha -h host -D database
   ```

2. **Verificar se a variável está configurada:**
   - Vá para Vercel → Settings → Environment Variables
   - Procure por `DATABASE_URL`
   - Certifique-se de que está lá

3. **Verificar se o banco de dados existe:**
   - Vá para PlanetScale
   - Verifique se seu banco de dados está criado
   - Verifique se o status é "Ready"

4. **Verificar string de conexão:**
   - Copie a string de conexão do PlanetScale novamente
   - Certifique-se de que não tem espaços extras
   - Atualize em Vercel

5. **Aguardar propagação:**
   - Às vezes leva alguns minutos
   - Aguarde 5-10 minutos
   - Tente novamente

---

### Problema 3: "502 Bad Gateway"

**Sintomas:**
- Você acessa seu site e vê "502 Bad Gateway"
- Ou "Error 502"

**Soluções:**

1. **Verificar logs:**
   - Vá para Vercel → Deployments
   - Clique em "Logs"
   - Procure por erros

2. **Verificar se o servidor está respondendo:**
   - Verifique a conexão com o banco de dados
   - Verifique se há erros no código

3. **Fazer redeploy:**
   ```bash
   git push origin main
   # Ou clique em "Redeploy" no Vercel
   ```

4. **Aguardar:**
   - Às vezes é problema temporário
   - Aguarde 5-10 minutos
   - Tente novamente

---

### Problema 4: "404 Not Found"

**Sintomas:**
- Você acessa seu site e vê "404 Not Found"
- Ou "Page not found"

**Soluções:**

1. **Verificar se o build foi bem-sucedido:**
   - Vá para Vercel → Deployments
   - Procure por ✅ (sucesso)

2. **Verificar arquivo vercel.json:**
   - Certifique-se de que `vercel.json` existe
   - Certifique-se de que está correto

3. **Verificar se dist/ foi criado:**
   ```bash
   pnpm run build
   ls dist/
   ```

4. **Fazer redeploy:**
   ```bash
   git push origin main
   ```

---

### Problema 5: "Variáveis de ambiente não funcionam"

**Sintomas:**
- Seu código tenta usar uma variável de ambiente
- Mas ela é undefined

**Soluções:**

1. **Verificar se a variável está configurada:**
   - Vá para Vercel → Settings → Environment Variables
   - Procure pela variável
   - Certifique-se de que está lá

2. **Verificar nome da variável:**
   - Variáveis devem ser exatas
   - `DATABASE_URL` é diferente de `database_url`
   - Verifique a grafia

3. **Fazer redeploy:**
   - Às vezes precisa fazer redeploy
   - Vá para Deployments
   - Clique em "Redeploy"

4. **Verificar se é variável de cliente:**
   - Variáveis de cliente devem começar com `VITE_`
   - Exemplo: `VITE_APP_ID`

---

### Problema 6: "Erro ao fazer push para GitHub"

**Sintomas:**
- Você tenta fazer `git push`
- Mas recebe um erro

**Soluções:**

1. **Erro: "Permission denied (publickey)"**
   ```bash
   # Solução: Usar HTTPS em vez de SSH
   git remote set-url origin https://github.com/seu-usuario/bitbaby-login.git
   git push origin main
   ```

2. **Erro: "fatal: not a git repository"**
   ```bash
   # Solução: Inicializar repositório
   git init
   git remote add origin https://github.com/seu-usuario/bitbaby-login.git
   git push -u origin main
   ```

3. **Erro: "Updates were rejected"**
   ```bash
   # Solução: Fazer pull antes de push
   git pull origin main
   git push origin main
   ```

---

### Problema 7: "Meu site está muito lento"

**Sintomas:**
- Seu site demora muito para carregar
- Ou responde lentamente

**Soluções:**

1. **Verificar conexão com banco de dados:**
   - Verifique se o PlanetScale está respondendo
   - Teste a conexão localmente

2. **Otimizar queries:**
   - Adicione índices no banco de dados
   - Reduza o número de queries
   - Use cache

3. **Verificar tamanho dos assets:**
   - Comprima imagens
   - Minifique CSS/JS
   - Use CDN

4. **Monitorar com Vercel Analytics:**
   - Vá para Vercel → Analytics
   - Veja quais páginas são lentas
   - Otimize as lentas

---

### Problema 8: "Erro ao conectar com PlanetScale"

**Sintomas:**
- Você tenta testar a conexão com PlanetScale
- Mas recebe um erro

**Soluções:**

1. **Verificar string de conexão:**
   ```bash
   # Copie novamente do PlanetScale
   # Certifique-se de que não tem espaços
   ```

2. **Verificar credenciais:**
   - Verifique o nome de usuário
   - Verifique a senha
   - Verifique o host

3. **Verificar se o banco de dados existe:**
   - Vá para PlanetScale
   - Procure pelo seu banco de dados
   - Verifique se o status é "Ready"

4. **Testar conexão:**
   ```bash
   mysql -u usuario -psenha -h host -D database
   ```

---

## ❓ Perguntas Frequentes

### P: Quanto tempo leva para fazer deploy?

R: Geralmente 2-5 minutos. Às vezes pode levar até 10 minutos se o build for grande.

### P: Posso fazer deploy enquanto estou desenvolvendo?

R: Sim! Vercel faz deploy automático a cada push. Você pode fazer push com frequência.

### P: Como faço rollback se algo der errado?

R: Vá para Vercel → Deployments, clique no deployment anterior, clique em "Promote to Production".

### P: Meu site foi hackeado, o que fazer?

R: 
1. Mude suas senhas (JWT_SECRET, ADMIN_KEY)
2. Faça push novamente
3. Vercel fará redeploy automaticamente

### P: Posso usar meu próprio domínio?

R: Sim! Vá para Vercel → Settings → Domains, adicione seu domínio e configure o DNS.

### P: Quanto custa depois que crescer?

R: Vercel cobra por:
- Bandwidth (acima de 100GB/mês)
- Build time (acima de 6000 minutos/mês)
- Serverless functions

PlanetScale cobra por:
- Armazenamento (acima de 5GB)
- Requisições (acima de 10M/mês)

### P: Como faço para ver logs em tempo real?

R: Vá para Vercel → Deployments → Clique no deployment → Logs.

### P: Posso usar variáveis de ambiente diferentes por ambiente?

R: Sim! Vercel suporta:
- Production (main branch)
- Preview (pull requests)
- Development (local)

Configure em Settings → Environment Variables.

### P: Como faço para aumentar o plano do PlanetScale?

R: Vá para PlanetScale → Settings → Billing, escolha um plano Pro.

### P: Posso usar outro banco de dados em vez de PlanetScale?

R: Sim! Você pode usar:
- AWS RDS
- DigitalOcean Managed Databases
- Seu próprio servidor MySQL
- Google Cloud SQL

Basta mudar a `DATABASE_URL`.

### P: Como faço para fazer backup do meu banco de dados?

R: PlanetScale faz backups automáticos. Você pode acessá-los em PlanetScale → Backups.

### P: Meu código tem um bug em produção, como faço para corrigir?

R: 
1. Corrija o bug localmente
2. Teste com `pnpm test`
3. Faça commit: `git commit -m "fix: Descrição"`
4. Faça push: `git push origin main`
5. Vercel fará deploy automaticamente

### P: Posso usar variáveis de ambiente secretas?

R: Sim! Todas as variáveis em Vercel são secretas. Elas não aparecem no código.

---

## 📞 Contatos de Suporte

### Vercel
- **Documentação:** https://vercel.com/docs
- **Status:** https://www.vercelstatus.com
- **Discord:** https://discord.gg/vercel
- **Email:** support@vercel.com

### PlanetScale
- **Documentação:** https://planetscale.com/docs
- **Discord:** https://discord.gg/planetscale
- **Email:** support@planetscale.com

### GitHub
- **Documentação:** https://docs.github.com
- **Community:** https://github.community
- **Email:** support@github.com

---

## 🎯 Checklist de Troubleshooting

Se algo não funcionar, siga este checklist:

- [ ] Verificar logs em Vercel
- [ ] Verificar se todas as variáveis estão configuradas
- [ ] Verificar se o banco de dados está acessível
- [ ] Verificar se o código compila localmente (`pnpm check`)
- [ ] Verificar se os testes passam (`pnpm test`)
- [ ] Fazer redeploy em Vercel
- [ ] Aguardar 5-10 minutos
- [ ] Limpar cache do navegador (Ctrl+Shift+Delete)
- [ ] Tentar em outro navegador
- [ ] Contatar suporte se nada funcionar

---

**Ainda tem dúvidas?** Consulte a documentação oficial ou contate o suporte!
