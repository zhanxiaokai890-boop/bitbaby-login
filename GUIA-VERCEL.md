# 🚀 Guia Completo: Vercel Setup

Este guia fornece instruções passo a passo para fazer deploy do seu projeto Bitbaby Login na Vercel.

## 📋 O que é Vercel?

**Vercel** é uma plataforma de hosting que oferece:

- ✅ Deploy automático a cada push no GitHub
- ✅ Suporte nativo para Node.js
- ✅ Plano gratuito generoso
- ✅ SSL/HTTPS automático
- ✅ Performance otimizada com CDN global
- ✅ Sem necessidade de gerenciar servidor

## ⚠️ Pré-requisitos

Antes de começar, você precisa ter:

1. ✅ Projeto no GitHub (veja GUIA-GITHUB.md)
2. ✅ Banco de dados PlanetScale configurado (veja GUIA-PLANETSCALE.md)
3. ✅ String de conexão MySQL copiada
4. ✅ Conta GitHub

## 🚀 PASSO 1: Criar Conta na Vercel

### 1.1 Acessar o site

1. Abra seu navegador
2. Acesse: https://vercel.com
3. Clique em **"Sign Up"** (canto superior direito)

### 1.2 Criar conta com GitHub

**Recomendado:** Use sua conta GitHub para facilitar a integração

1. Clique em **"Continue with GitHub"**
2. Você será redirecionado para o GitHub
3. Clique em **"Authorize vercel"**
4. Pronto! Sua conta foi criada

### 1.3 Autorizar Vercel no GitHub

Na primeira vez, o GitHub pedirá permissão:

1. Clique em **"Authorize vercel"**
2. Você pode escolher quais repositórios a Vercel pode acessar
3. Recomendado: Selecione apenas seu repositório `bitbaby-login`
4. Clique em **"Install"**

## 📦 PASSO 2: Importar Projeto

### 2.1 Acessar dashboard

1. Após criar a conta, você verá o dashboard
2. Clique em **"New Project"** ou **"Add New"**

### 2.2 Selecionar repositório

1. Você verá uma lista de seus repositórios GitHub
2. Procure por **"bitbaby-login"**
3. Clique em **"Import"** ou **"Select"**

### 2.3 Configurar projeto

Uma página de configuração aparecerá:

**Project Name:**
- Deixe como `bitbaby-login` (ou customize)
- Este será seu domínio: `bitbaby-login.vercel.app`

**Framework:**
- Deixe como **"Other"** (já detectado automaticamente)

**Build Command:**
- Deve estar: `pnpm run build`
- Se não estiver, mude para isso

**Output Directory:**
- Deve estar: `dist`
- Se não estiver, mude para isso

**Install Command:**
- Deve estar: `pnpm install --frozen-lockfile`

Clique em **"Deploy"** para continuar.

## 🔐 PASSO 3: Configurar Variáveis de Ambiente

### 3.1 Acessar configurações

Antes do deploy final, você precisa configurar as variáveis de ambiente:

1. Na página de deploy, você verá **"Environment Variables"**
2. Ou vá para **"Settings"** → **"Environment Variables"**

### 3.2 Adicionar variáveis

Adicione as seguintes variáveis:

| Variável | Valor | Exemplo |
|----------|-------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host/db?ssl=true` |
| `JWT_SECRET` | Chave secreta (gerar com `openssl rand -base64 32`) | `abc123xyz...` |
| `ADMIN_KEY` | Chave admin (gerar com `openssl rand -hex 16`) | `abc123def456...` |
| `VITE_APP_ID` | ID da sua aplicação | `seu_app_id` |
| `OWNER_OPEN_ID` | OpenID do proprietário | `seu_owner_id` |
| `NODE_ENV` | Ambiente | `production` |

### 3.3 Gerar JWT_SECRET

Abra o terminal e execute:

```bash
openssl rand -base64 32
```

Você receberá algo como:
```
aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ3aB4cD5eF6gH7iJ8kL9mN0oP1qR2sT3uV4wX5yZ6aB7cD8eF9gH0iJ1kL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV0wX1yZ2aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5aB6cD7eF8gH9iJ0kL1mN2oP3qR4sT5uV6wX7yZ8aB9cD0eF1gH2iJ3kL4mN5oP6qR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV2wX3yZ4aB5cD6eF7gH8iJ9kL0mN1oP2qR3sT4uV5wX6yZ7aB8cD9eF0gH1iJ2kL3mN4oP5qR6sT7uV8wX9yZ0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0uV1wX2yZ2
```

Copie esse valor e use como `JWT_SECRET`.

### 3.4 Gerar ADMIN_KEY

```bash
openssl rand -hex 16
```

Você receberá algo como:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Copie esse valor e use como `ADMIN_KEY`.

### 3.5 Adicionar variáveis na Vercel

1. Clique em **"Add New"** para cada variável
2. Digite o nome da variável (ex: `DATABASE_URL`)
3. Digite o valor (ex: sua string de conexão)
4. Clique em **"Save"**
5. Repita para todas as variáveis

**Importante:** Não deixe espaços em branco antes ou depois dos valores!

## ✅ PASSO 4: Fazer Deploy

### 4.1 Iniciar deploy

1. Após adicionar todas as variáveis
2. Clique em **"Deploy"** (botão azul)
3. Aguarde o deploy completar (2-5 minutos)

### 4.2 Acompanhar deploy

Você verá uma página com o progresso:

```
✅ Building...
✅ Optimizing...
✅ Uploading...
✅ Done!
```

Se tudo correr bem, você verá:
```
✅ Deployment successful!
```

### 4.3 Acessar seu projeto

1. Clique em **"Visit"** ou **"Go to Dashboard"**
2. Seu projeto estará em: `https://bitbaby-login.vercel.app`
3. Parabéns! Seu projeto está online!

## 🔄 PASSO 5: Configurar Deploy Automático

### 5.1 Entender deploy automático

Por padrão, Vercel faz deploy automático a cada push no GitHub:

- Quando você faz `git push` para `main`
- Vercel detecta a mudança
- Vercel faz build automaticamente
- Seu site é atualizado em 2-5 minutos

### 5.2 Desabilitar deploy automático (opcional)

Se quiser controlar quando fazer deploy:

1. Vá para **"Settings"** → **"Git"**
2. Procure por **"Deploy on Push"**
3. Desabilite se quiser
4. Agora você pode fazer deploy manualmente

## 🌐 PASSO 6: Configurar Domínio Customizado (Opcional)

### 6.1 Adicionar domínio

Se você tem um domínio próprio (ex: `seu-dominio.com`):

1. Vá para **"Settings"** → **"Domains"**
2. Clique em **"Add Domain"**
3. Digite seu domínio
4. Clique em **"Add"**

### 6.2 Configurar DNS

Vercel fornecerá instruções para configurar seu DNS:

1. Vá para seu registrador de domínio (GoDaddy, Namecheap, etc.)
2. Procure por **"DNS Settings"**
3. Adicione os registros fornecidos pela Vercel
4. Aguarde 24-48 horas para propagar

### 6.3 Ativar SSL

SSL é ativado automaticamente para domínios customizados!

## 📊 PASSO 7: Monitorar Seu Projeto

### 7.1 Ver logs

Para ver o que está acontecendo:

1. Vá para seu projeto no Vercel
2. Clique em **"Deployments"**
3. Clique no deployment mais recente
4. Clique em **"Logs"**

### 7.2 Ver analytics

Para ver estatísticas de uso:

1. Vá para **"Analytics"**
2. Você verá:
   - Requisições por dia
   - Tempo de resposta
   - Erros
   - Bandwidth

### 7.3 Configurar alertas

Para ser notificado de problemas:

1. Vá para **"Settings"** → **"Notifications"**
2. Ative as notificações que quiser
3. Configure seu email

## 🔄 PASSO 8: Fazer Atualizações

### 8.1 Atualizar código

Quando você quer fazer mudanças:

```bash
# Fazer mudanças no código
# ...

# Testar localmente
pnpm test
pnpm run build

# Fazer commit
git add .
git commit -m "feat: Descrição da mudança"

# Fazer push
git push origin main
```

### 8.2 Deploy automático

Vercel fará deploy automaticamente:

1. Você verá um novo deployment em **"Deployments"**
2. Aguarde 2-5 minutos
3. Seu site será atualizado automaticamente

### 8.3 Rollback (voltar versão anterior)

Se algo der errado:

1. Vá para **"Deployments"**
2. Clique no deployment anterior
3. Clique em **"Promote to Production"**
4. Seu site voltará para a versão anterior

## ❓ Perguntas Frequentes

### P: Quanto custa Vercel?

R: Vercel é gratuito para começar! Você só paga se:
- Exceder 100GB de bandwidth/mês
- Precisar de recursos premium
- Quiser suporte prioritário

### P: Meu site está lento, o que fazer?

R: Vercel é muito rápido. Se estiver lento:
1. Verifique a conexão com o banco de dados
2. Verifique os logs em **"Analytics"**
3. Otimize suas queries
4. Contate o suporte Vercel

### P: Como faço backup?

R: Seu código está no GitHub (backup automático). Seu banco de dados está no PlanetScale (backup automático). Você está seguro!

### P: Posso usar variáveis de ambiente diferentes por ambiente?

R: Sim! Vercel suporta:
- **Production** (main branch)
- **Preview** (pull requests)
- **Development** (local)

Configure em **"Settings"** → **"Environment Variables"**

### P: Como faço para aumentar o plano?

R: Vá para **"Settings"** → **"Billing"** e escolha um plano Pro.

## 🆘 Troubleshooting

### Erro: "Build failed"

**Solução:**
1. Verifique os logs em **"Deployments"**
2. Verifique se todas as variáveis estão configuradas
3. Verifique se o banco de dados está acessível
4. Tente fazer push novamente

### Erro: "Cannot connect to database"

**Solução:**
1. Verifique se a `DATABASE_URL` está correta
2. Verifique se o banco de dados está criado no PlanetScale
3. Verifique se o IP da Vercel está permitido (geralmente é)
4. Tente novamente em alguns minutos

### Erro: "502 Bad Gateway"

**Solução:**
1. Verifique os logs
2. Verifique se o servidor está respondendo
3. Aguarde alguns minutos
4. Tente novamente

### Meu site mostra "404 Not Found"

**Solução:**
1. Verifique se o build foi bem-sucedido
2. Verifique se o arquivo `dist/index.html` existe
3. Verifique o arquivo `vercel.json`
4. Tente fazer redeploy

## 📞 Suporte

- **Documentação Vercel:** https://vercel.com/docs
- **Discord Vercel:** https://discord.gg/vercel
- **Email:** support@vercel.com
- **Status Page:** https://www.vercelstatus.com

---

**Parabéns!** Seu projeto está online na Vercel! 🎉

Agora você pode:
- Compartilhar seu link com outras pessoas
- Configurar um domínio customizado
- Monitorar seu projeto
- Fazer atualizações facilmente

**Próximos passos:**
1. Teste seu site em `https://bitbaby-login.vercel.app`
2. Configure um domínio customizado (opcional)
3. Compartilhe com o mundo!
