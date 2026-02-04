# 🐙 Guia Completo: GitHub Setup

Este guia fornece instruções passo a passo para colocar seu projeto no GitHub, que é necessário para fazer deploy na Vercel.

## 📋 O que é GitHub?

**GitHub** é uma plataforma de controle de versão que oferece:

- ✅ Armazenamento de código na nuvem
- ✅ Histórico de mudanças
- ✅ Colaboração entre desenvolvedores
- ✅ Integração com Vercel
- ✅ Backup automático
- ✅ Gratuito para repositórios públicos

## 🚀 PASSO 1: Criar Conta no GitHub

### 1.1 Acessar o site

1. Abra seu navegador
2. Acesse: https://github.com
3. Clique em **"Sign up"** (canto superior direito)

### 1.2 Criar conta

1. Digite seu email
2. Crie uma senha forte
3. Digite um nome de usuário (ex: `seu-nome-usuario`)
4. Escolha se quer receber emails
5. Clique em **"Create account"**

### 1.3 Verificar email

1. GitHub enviará um email de confirmação
2. Abra seu email
3. Clique no link de confirmação
4. Pronto! Sua conta foi criada

## 🔧 PASSO 2: Instalar Git Localmente

Git é a ferramenta que você usa para enviar código para GitHub.

### 2.1 Instalar no Windows

1. Acesse: https://git-scm.com/download/win
2. Baixe o instalador
3. Execute o instalador
4. Clique em **"Next"** em todas as telas
5. Clique em **"Finish"**

### 2.2 Instalar no macOS

```bash
# Instalar com Homebrew
brew install git
```

### 2.3 Instalar no Linux

```bash
# Ubuntu/Debian
sudo apt-get install git

# Fedora
sudo dnf install git
```

### 2.4 Verificar instalação

Abra o terminal/prompt de comando e execute:

```bash
git --version
```

Você deve ver algo como:
```
git version 2.40.0
```

## 🔑 PASSO 3: Configurar Git

### 3.1 Configurar nome e email

No terminal, execute:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@example.com"
```

**Importante:** Use o mesmo email que você usou no GitHub!

### 3.2 Gerar chave SSH (Recomendado)

Chave SSH permite fazer push sem digitar senha toda vez:

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"
```

Você verá:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/user/.ssh/id_ed25519):
```

Pressione **Enter** para aceitar o local padrão.

```
Enter passphrase (empty for no passphrase):
```

Pressione **Enter** (ou digite uma senha se quiser).

### 3.3 Adicionar chave SSH ao GitHub

1. Copie sua chave pública:

**Windows (PowerShell):**
```bash
type $env:USERPROFILE\.ssh\id_ed25519.pub | clip
```

**macOS/Linux:**
```bash
cat ~/.ssh/id_ed25519.pub | pbcopy
```

2. Vá para GitHub: https://github.com/settings/keys
3. Clique em **"New SSH key"**
4. Digite um título (ex: "Meu Computador")
5. Cole sua chave no campo "Key"
6. Clique em **"Add SSH key"**

## 📦 PASSO 4: Criar Repositório no GitHub

### 4.1 Acessar GitHub

1. Faça login no GitHub
2. Clique no ícone de perfil (canto superior direito)
3. Clique em **"Your repositories"**

### 4.2 Criar novo repositório

1. Clique em **"New"** (botão verde)
2. Ou acesse: https://github.com/new

### 4.3 Configurar repositório

**Repository name:**
- Digite: `bitbaby-login`

**Description (opcional):**
- Digite: `Sistema de autenticação multi-fator para plataforma de trading`

**Public ou Private:**
- Escolha **"Public"** (gratuito)
- Ou **"Private"** (se quiser privado)

**Initialize this repository with:**
- **NÃO** marque nada (você já tem código local)

Clique em **"Create repository"**

### 4.4 Copiar URL do repositório

Você verá uma página com instruções. Copie a URL:

**SSH (Recomendado):**
```
git@github.com:seu-usuario/bitbaby-login.git
```

**HTTPS:**
```
https://github.com/seu-usuario/bitbaby-login.git
```

## 🚀 PASSO 5: Fazer Push do Código

### 5.1 Abrir terminal na pasta do projeto

```bash
cd /caminho/para/bitbaby-login
```

### 5.2 Inicializar repositório (se não tiver feito)

Se você já fez `git init` anteriormente, pule este passo.

```bash
git init
```

### 5.3 Adicionar repositório remoto

```bash
# Se usar SSH (recomendado)
git remote add origin git@github.com:seu-usuario/bitbaby-login.git

# Se usar HTTPS
git remote add origin https://github.com/seu-usuario/bitbaby-login.git
```

### 5.4 Verificar remote

```bash
git remote -v
```

Você deve ver:
```
origin  git@github.com:seu-usuario/bitbaby-login.git (fetch)
origin  git@github.com:seu-usuario/bitbaby-login.git (push)
```

### 5.5 Fazer push do código

```bash
# Fazer push da branch main
git push -u origin main
```

Se receber um erro sobre branch:

```bash
# Renomear branch para main (se necessário)
git branch -M main

# Tentar novamente
git push -u origin main
```

### 5.6 Verificar no GitHub

1. Vá para seu repositório no GitHub
2. Você deve ver seus arquivos
3. Parabéns! Seu código está no GitHub!

## 📝 PASSO 6: Fazer Commits Regulares

### 6.1 Fazer mudanças

Quando você quer atualizar o código:

```bash
# Ver quais arquivos mudaram
git status

# Adicionar todos os arquivos
git add .

# Ou adicionar arquivos específicos
git add arquivo.ts

# Fazer commit
git commit -m "feat: Descrição da mudança"

# Fazer push
git push origin main
```

### 6.2 Mensagens de commit boas

Use este formato:

```
feat: Adicionar nova funcionalidade
fix: Corrigir bug
docs: Atualizar documentação
style: Formatar código
refactor: Refatorar código
test: Adicionar testes
chore: Atualizar dependências
```

**Exemplos:**
```bash
git commit -m "feat: Adicionar verificação SMS"
git commit -m "fix: Corrigir erro de conexão"
git commit -m "docs: Atualizar README"
```

## 🔄 PASSO 7: Sincronizar com Vercel

### 7.1 Conectar GitHub ao Vercel

Quando você fizer deploy na Vercel:

1. Vercel pedirá para autorizar GitHub
2. Clique em **"Authorize vercel"**
3. Selecione seu repositório
4. Clique em **"Install"**

### 7.2 Deploy automático

Agora, toda vez que você fizer push:

```bash
git push origin main
```

Vercel detectará a mudança e fará deploy automaticamente!

## 🌳 PASSO 8: Gerenciar Branches (Avançado)

### 8.1 Criar branch para desenvolvimento

```bash
# Criar nova branch
git checkout -b develop

# Fazer mudanças
# ...

# Fazer commit
git add .
git commit -m "feat: Nova funcionalidade"

# Fazer push
git push origin develop
```

### 8.2 Fazer merge com main

```bash
# Voltar para main
git checkout main

# Fazer merge
git merge develop

# Fazer push
git push origin main
```

### 8.3 Deletar branch

```bash
# Deletar localmente
git branch -d develop

# Deletar no GitHub
git push origin --delete develop
```

## ❓ Perguntas Frequentes

### P: Qual é a diferença entre SSH e HTTPS?

R: 
- **SSH:** Mais seguro, não precisa digitar senha
- **HTTPS:** Mais simples, mas precisa digitar senha

Recomendado: SSH

### P: Como faço para colaborar com outros?

R: 
1. Convide pessoas para seu repositório
2. Vá para **"Settings"** → **"Collaborators"**
3. Clique em **"Add people"**
4. Digite o nome de usuário GitHub

### P: Como faço para criar um fork?

R: Um fork é uma cópia de um repositório:
1. Vá para o repositório
2. Clique em **"Fork"** (canto superior direito)
3. Você terá uma cópia em sua conta

### P: Como faço para fazer um Pull Request?

R: Um Pull Request é uma forma de sugerir mudanças:
1. Faça mudanças em uma branch
2. Clique em **"Compare & pull request"**
3. Descreva suas mudanças
4. Clique em **"Create pull request"**

### P: Posso deletar meu repositório?

R: Sim, mas tenha cuidado!
1. Vá para **"Settings"**
2. Procure por **"Delete this repository"**
3. Confirme digitando o nome do repositório

## 🆘 Troubleshooting

### Erro: "Permission denied (publickey)"

**Solução:**
1. Verifique se sua chave SSH está adicionada ao GitHub
2. Tente usar HTTPS em vez de SSH
3. Gere uma nova chave SSH

### Erro: "fatal: remote origin already exists"

**Solução:**
```bash
# Remover remote existente
git remote remove origin

# Adicionar novo remote
git remote add origin git@github.com:seu-usuario/bitbaby-login.git
```

### Erro: "fatal: not a git repository"

**Solução:**
```bash
# Inicializar repositório
git init

# Adicionar remote
git remote add origin git@github.com:seu-usuario/bitbaby-login.git

# Fazer push
git push -u origin main
```

### Meus commits não aparecem no GitHub

**Solução:**
1. Verifique se você fez push: `git push origin main`
2. Verifique se está usando o email correto: `git config user.email`
3. Verifique se está na branch correta: `git branch`

## 📞 Suporte

- **Documentação GitHub:** https://docs.github.com
- **GitHub Community:** https://github.community
- **Email:** support@github.com

---

**Pronto!** Seu código está no GitHub! Agora você pode fazer deploy na Vercel.

**Próximos passos:**
1. Vá para o **GUIA-PLANETSCALE.md** para configurar banco de dados
2. Vá para o **GUIA-VERCEL.md** para fazer deploy
