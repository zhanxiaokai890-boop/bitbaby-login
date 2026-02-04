# ⚡ Guia de Início Rápido - Deploy em 15 Minutos

Se você quer fazer deploy agora sem ler tudo, siga este guia rápido!

## 📋 Resumo dos Passos

1. **GitHub** - Colocar código no GitHub (5 min)
2. **PlanetScale** - Criar banco de dados (3 min)
3. **Vercel** - Fazer deploy (5 min)
4. **Pronto!** - Seu site está online

**Tempo total: ~15 minutos**

---

## 🚀 PASSO 1: GitHub (5 minutos)

### 1.1 Criar conta
- Vá para https://github.com/signup
- Crie sua conta

### 1.2 Criar repositório
- Vá para https://github.com/new
- Nome: `bitbaby-login`
- Clique em **"Create repository"**

### 1.3 Fazer push do código

```bash
# Abra terminal na pasta do projeto
cd /caminho/para/bitbaby-login

# Configurar Git (primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@github.com"

# Adicionar repositório remoto
git remote add origin https://github.com/seu-usuario/bitbaby-login.git

# Fazer push
git branch -M main
git push -u origin main
```

**Pronto!** Seu código está no GitHub.

---

## 🗄️ PASSO 2: PlanetScale (3 minutos)

### 2.1 Criar conta
- Vá para https://planetscale.com/signup
- Crie sua conta com GitHub

### 2.2 Criar banco de dados
- Clique em **"Create a new database"**
- Nome: `bitbaby_login`
- Plano: **Free**
- Clique em **"Create database"**

### 2.3 Obter string de conexão
- Clique no banco de dados
- Clique em **"Connect"**
- Selecione **"MySQL"**
- Copie a string de conexão

**Exemplo:**
```
mysql://user123:password456@aws.connect.psdb.cloud/bitbaby_login?sslaccept=strict
```

**Salve em um lugar seguro!**

---

## 🚀 PASSO 3: Vercel (5 minutos)

### 3.1 Criar conta
- Vá para https://vercel.com/signup
- Clique em **"Continue with GitHub"**
- Autorize Vercel

### 3.2 Importar projeto
- Clique em **"New Project"**
- Selecione `bitbaby-login`
- Clique em **"Import"**

### 3.3 Configurar variáveis de ambiente

Na tela de configuração, clique em **"Environment Variables"** e adicione:

| Nome | Valor |
|------|-------|
| `DATABASE_URL` | Cole a string do PlanetScale |
| `JWT_SECRET` | Gere com: `openssl rand -base64 32` |
| `ADMIN_KEY` | Gere com: `openssl rand -hex 16` |
| `VITE_APP_ID` | `seu_app_id` |
| `OWNER_OPEN_ID` | `seu_owner_id` |
| `NODE_ENV` | `production` |

### 3.4 Fazer deploy
- Clique em **"Deploy"**
- Aguarde 2-5 minutos
- Pronto! Seu site está online!

**Seu site estará em:** `https://bitbaby-login.vercel.app`

---

## ✅ Pronto!

Seu projeto está online! 🎉

**Próximos passos:**
1. Teste seu site em `https://bitbaby-login.vercel.app`
2. Compartilhe com outras pessoas
3. Configure um domínio customizado (opcional)

---

## 🆘 Algo deu errado?

Se algo não funcionar:

1. **Verifique os logs no Vercel**
   - Vá para seu projeto
   - Clique em **"Deployments"**
   - Clique no deployment que falhou
   - Clique em **"Logs"**

2. **Verifique se todas as variáveis estão configuradas**
   - Vá para **"Settings"** → **"Environment Variables"**
   - Certifique-se de que todas estão lá

3. **Verifique se o banco de dados está acessível**
   - Vá para PlanetScale
   - Verifique se seu banco de dados está "Ready"

4. **Consulte o guia completo**
   - Veja `GUIA-TROUBLESHOOTING.md`

---

## 📚 Guias Completos

Para mais detalhes, consulte:

- **GUIA-GITHUB.md** - Setup GitHub detalhado
- **GUIA-PLANETSCALE.md** - Setup PlanetScale detalhado
- **GUIA-VERCEL.md** - Setup Vercel detalhado
- **GUIA-TROUBLESHOOTING.md** - Resolver problemas

---

**Parabéns! Seu projeto está online!** 🚀
