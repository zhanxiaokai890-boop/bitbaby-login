# 📢 Guia de Publicação - Bitbaby Login

Este documento fornece um resumo rápido de como publicar o projeto Bitbaby Login.

## 🎯 Opções de Publicação Recomendadas

### 1️⃣ **Vercel** (Recomendado - Mais Fácil)

**Por que escolher Vercel:**
- Deploy automático a cada push no GitHub
- Suporte nativo para Node.js
- Integração perfeita com Next.js e frameworks modernos
- Plano gratuito generoso
- Performance otimizada com edge functions

**Passos rápidos:**

```bash
# 1. Fazer push para GitHub
git push origin main

# 2. Acessar https://vercel.com
# 3. Clicar em "New Project"
# 4. Selecionar seu repositório
# 5. Configurar variáveis de ambiente
# 6. Clicar em "Deploy"
```

**Variáveis necessárias no Vercel:**
```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=sua_chave_secreta
ADMIN_KEY=admin123
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=production
```

### 2️⃣ **Netlify** (Alternativa)

**Por que escolher Netlify:**
- Deploy automático via Git
- Suporte para funções serverless
- Plano gratuito com boas funcionalidades
- Integração com formulários

**Passos rápidos:**

```bash
# 1. Fazer push para GitHub
git push origin main

# 2. Acessar https://netlify.com
# 3. Clicar em "New site from Git"
# 4. Selecionar seu repositório
# 5. Configurar variáveis de ambiente
# 6. Clicar em "Deploy site"
```

### 3️⃣ **Docker + Cloud Run** (Google Cloud)

**Por que escolher Google Cloud:**
- Plano gratuito com créditos
- Escalabilidade automática
- Suporte para containers

**Passos rápidos:**

```bash
# 1. Instalar Google Cloud CLI
curl https://sdk.cloud.google.com | bash

# 2. Autenticar
gcloud auth login

# 3. Fazer push da imagem
docker build -t bitbaby-login:latest .
docker tag bitbaby-login:latest gcr.io/seu-projeto/bitbaby-login:latest
docker push gcr.io/seu-projeto/bitbaby-login:latest

# 4. Deploy
gcloud run deploy bitbaby-login \
  --image gcr.io/seu-projeto/bitbaby-login:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="...",JWT_SECRET="..."
```

## 📋 Checklist Pré-Publicação

Antes de publicar, certifique-se de:

- [ ] **Código testado**: `pnpm test` - todos os testes passando
- [ ] **TypeScript compilado**: `pnpm check` - sem erros
- [ ] **Build bem-sucedido**: `pnpm run build` - sem erros
- [ ] **Variáveis de ambiente**: Todas as variáveis configuradas
- [ ] **Banco de dados**: Criado e acessível
- [ ] **Migrations**: Executadas (`pnpm run db:push`)
- [ ] **Arquivo .env**: NÃO está no repositório (verificar `.gitignore`)
- [ ] **Domínio**: Configurado (se aplicável)
- [ ] **SSL/HTTPS**: Ativado
- [ ] **Logs**: Configurados para monitoramento

## 🔐 Segurança Antes de Publicar

### Gerar JWT_SECRET seguro

```bash
openssl rand -base64 32
```

Copie o resultado e use como `JWT_SECRET`.

### Gerar ADMIN_KEY seguro

```bash
openssl rand -hex 16
```

### Verificar variáveis sensíveis

Certifique-se de que nenhuma variável sensível está no código:

```bash
# Procurar por hardcoded secrets
grep -r "password\|secret\|key" --include="*.ts" --include="*.tsx" --include="*.js" .
```

## 📊 Banco de Dados Recomendados

### Para produção:

1. **PlanetScale** (MySQL serverless)
   - Gratuito para começar
   - Escalabilidade automática
   - Backups automáticos
   - https://planetscale.com

2. **AWS RDS** (MySQL gerenciado)
   - Mais controle
   - Backups automáticos
   - Multi-AZ para alta disponibilidade
   - https://aws.amazon.com/rds/

3. **DigitalOcean Managed Databases**
   - Preço acessível
   - Interface simples
   - Backups automáticos
   - https://www.digitalocean.com/products/managed-databases/

## 🚀 Processo de Deploy Passo a Passo

### Passo 1: Preparar repositório

```bash
# Certifique-se de estar na branch main
git checkout main

# Fazer pull das últimas mudanças
git pull origin main

# Verificar status
git status
```

### Passo 2: Testar localmente

```bash
# Instalar dependências
pnpm install

# Executar testes
pnpm test

# Compilar TypeScript
pnpm check

# Fazer build
pnpm run build

# Testar build localmente
pnpm run start
```

### Passo 3: Fazer push para GitHub

```bash
# Adicionar mudanças
git add .

# Fazer commit
git commit -m "feat: Prepare for production deployment"

# Fazer push
git push origin main
```

### Passo 4: Publicar na plataforma

**Para Vercel:**
1. Acesse https://vercel.com/dashboard
2. Seu projeto deve aparecer na lista
3. Clique em "Deploy" se não for automático
4. Aguarde o deploy completar

**Para Netlify:**
1. Acesse https://app.netlify.com
2. Seu projeto deve aparecer na lista
3. Aguarde o deploy automático

### Passo 5: Configurar domínio

1. Compre um domínio (GoDaddy, Namecheap, etc.)
2. Configure DNS para apontar para sua plataforma
3. Ative SSL/HTTPS (automático em Vercel e Netlify)

### Passo 6: Verificar deploy

```bash
# Acessar a URL do seu projeto
https://seu-projeto.vercel.app
# ou
https://seu-projeto.netlify.app

# Verificar se está funcionando
curl https://seu-projeto.vercel.app
```

## 🔄 Atualizações Futuras

Depois de publicado, para fazer atualizações:

```bash
# Fazer mudanças no código
# ...

# Testar localmente
pnpm test
pnpm run build

# Fazer commit
git add .
git commit -m "fix: Descrição da correção"

# Fazer push
git push origin main

# Deploy automático acontecerá automaticamente!
```

## 📞 Suporte de Plataformas

### Vercel
- Documentação: https://vercel.com/docs
- Suporte: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions

### Netlify
- Documentação: https://docs.netlify.com
- Suporte: https://support.netlify.com
- Community: https://community.netlify.com

### Google Cloud
- Documentação: https://cloud.google.com/docs
- Suporte: https://cloud.google.com/support
- Community: https://stackoverflow.com/questions/tagged/google-cloud-platform

## 🎉 Próximos Passos Após Deploy

1. **Configurar monitoramento**
   - Ativar logs
   - Configurar alertas
   - Monitorar performance

2. **Configurar backups**
   - Backups automáticos do banco de dados
   - Plano de disaster recovery

3. **Otimizar performance**
   - Ativar caching
   - Usar CDN para assets estáticos
   - Otimizar imagens

4. **Segurança**
   - Ativar HTTPS
   - Configurar CORS
   - Implementar rate limiting

5. **Monitoramento**
   - Configurar alertas de erro
   - Monitorar uptime
   - Analisar logs

## ❓ Perguntas Frequentes

**P: Quanto custa publicar em Vercel?**
R: Vercel oferece um plano gratuito generoso. Você só paga se exceder os limites.

**P: Posso usar meu próprio domínio?**
R: Sim, todas as plataformas suportam domínios customizados.

**P: Como faço rollback se algo der errado?**
R: Vercel e Netlify mantêm histórico de deployments. Você pode reverter para uma versão anterior.

**P: Preciso de um banco de dados separado?**
R: Sim, você precisa de um banco de dados MySQL externo. PlanetScale é recomendado.

**P: Posso usar variáveis de ambiente diferentes por ambiente?**
R: Sim, Vercel e Netlify suportam variáveis diferentes para production, preview e development.

## 📚 Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Netlify](https://docs.netlify.com)
- [Documentação Docker](https://docs.docker.com)
- [Documentação Node.js](https://nodejs.org/docs)
- [Documentação Express](https://expressjs.com)
- [Documentação React](https://react.dev)

---

**Pronto para publicar?** Escolha uma plataforma acima e siga os passos!
