# 🗄️ Guia Completo: PlanetScale Setup

Este guia fornece instruções passo a passo para configurar um banco de dados MySQL na PlanetScale, que será usado pelo seu projeto Bitbaby Login.

## 📋 O que é PlanetScale?

**PlanetScale** é um banco de dados MySQL serverless (hospedado na nuvem) que oferece:

- ✅ Plano gratuito com 5GB de armazenamento
- ✅ Escalabilidade automática
- ✅ Backups automáticos
- ✅ SSL/HTTPS automático
- ✅ Interface web intuitiva
- ✅ Suporte a múltiplas conexões

## 🚀 PASSO 1: Criar Conta na PlanetScale

### 1.1 Acessar o site

1. Abra seu navegador
2. Acesse: https://planetscale.com
3. Clique em **"Sign Up"** (canto superior direito)

### 1.2 Criar conta

Você pode se registrar de 3 formas:

**Opção A: Com GitHub (Recomendado)**
1. Clique em **"Continue with GitHub"**
2. Autorize a PlanetScale a acessar sua conta GitHub
3. Pronto! Sua conta foi criada

**Opção B: Com Google**
1. Clique em **"Continue with Google"**
2. Selecione sua conta Google
3. Pronto!

**Opção C: Com Email**
1. Digite seu email
2. Digite uma senha forte
3. Confirme seu email
4. Pronto!

### 1.3 Verificar email (se necessário)

Se você se registrou com email:
1. Verifique seu email
2. Clique no link de confirmação
3. Volte ao site da PlanetScale

## 🗂️ PASSO 2: Criar Banco de Dados

### 2.1 Acessar dashboard

1. Após fazer login, você verá o dashboard
2. Clique em **"Create a new database"** ou **"New database"**

### 2.2 Configurar banco de dados

**Nome do banco de dados:**
- Digite: `bitbaby_login`
- (Pode ser qualquer nome, mas este é recomendado)

**Região:**
- Escolha a região mais próxima de você
- Opções: US East, US West, EU West, etc.
- Se não sabe, escolha **US East (us-east-1)**

**Plano:**
- Selecione **"Free"** (Gratuito)
- Você pode fazer upgrade depois se necessário

### 2.3 Criar banco de dados

1. Clique em **"Create database"**
2. Aguarde 30-60 segundos
3. Seu banco de dados será criado

## 🔑 PASSO 3: Obter String de Conexão

### 3.1 Acessar configurações de conexão

1. Você verá seu banco de dados na lista
2. Clique nele para abrir
3. Clique em **"Connect"** (botão azul no topo)

### 3.2 Selecionar tipo de conexão

Uma janela aparecerá com opções:
- **Prisma** (não use)
- **MySQL** (use este!)
- **Node.js** (não use)
- **Python** (não use)

Clique em **"MySQL"**

### 3.3 Copiar string de conexão

Você verá algo como:

```
mysql://[username]:[password]@[host]/[database]
```

**Exemplo real:**
```
mysql://user123:password456@aws.connect.psdb.cloud/bitbaby_login?sslaccept=strict
```

**IMPORTANTE:**
1. Clique no ícone de cópia (📋) para copiar
2. Salve em um lugar seguro (bloco de notas)
3. **NÃO compartilhe com ninguém!**

### 3.4 Criar usuário (Opcional, mas recomendado)

Para maior segurança, crie um usuário específico:

1. No dashboard do banco de dados
2. Clique em **"Passwords"** ou **"Users"**
3. Clique em **"Create password"** ou **"New user"**
4. Digite um nome de usuário (ex: `bitbaby_app`)
5. Copie a senha gerada
6. Clique em **"Create"**

Agora você terá uma string de conexão com esse novo usuário.

## ✅ PASSO 4: Testar Conexão (Opcional)

### 4.1 Instalar MySQL client (opcional)

Se você quer testar a conexão localmente:

**No Windows:**
```bash
# Instalar MySQL
choco install mysql
```

**No macOS:**
```bash
# Instalar MySQL
brew install mysql-client
```

**No Linux:**
```bash
# Instalar MySQL
sudo apt-get install mysql-client
```

### 4.2 Testar conexão

```bash
mysql -u [username] -p[password] -h [host] -D [database]
```

**Exemplo:**
```bash
mysql -u user123 -ppassword456 -h aws.connect.psdb.cloud -D bitbaby_login
```

Se conectar com sucesso, você verá:
```
mysql>
```

Digite `exit` para sair.

## 📝 PASSO 5: Salvar Informações

Crie um arquivo de texto com suas informações:

```
=== PLANETSCALE - BITBABY LOGIN ===

Nome do Banco: bitbaby_login
Host: aws.connect.psdb.cloud
Usuário: user123
Senha: password456
Database: bitbaby_login

String de Conexão:
mysql://user123:password456@aws.connect.psdb.cloud/bitbaby_login?sslaccept=strict

Data de Criação: [DATA]
```

**IMPORTANTE:** Guarde este arquivo em um local seguro!

## 🔐 PASSO 6: Configurações de Segurança

### 6.1 Habilitar SSL (Automático)

PlanetScale já vem com SSL ativado por padrão. Nada a fazer!

### 6.2 Restringir acesso (Opcional)

1. Vá para **"Settings"** do seu banco de dados
2. Procure por **"Allowed Networks"** ou **"IP Whitelist"**
3. Você pode adicionar IPs específicos (Vercel fornecerá os IPs)
4. Por enquanto, deixe aberto (PlanetScale é seguro)

## 🚀 PASSO 7: Próximos Passos

Agora que você tem seu banco de dados:

1. **Copie a string de conexão**
2. **Vá para o Guia Vercel** (GUIA-VERCEL.md)
3. **Configure a variável DATABASE_URL no Vercel**
4. **Faça o deploy!**

## ❓ Perguntas Frequentes

### P: Posso usar o plano gratuito em produção?

R: Sim! O plano gratuito da PlanetScale é excelente para começar. Você tem 5GB de armazenamento, que é suficiente para muitos usuários. Quando crescer, você pode fazer upgrade.

### P: Quanto custa fazer upgrade?

R: O plano Pro custa ~$39/mês e oferece:
- Armazenamento ilimitado
- Múltiplas regiões
- Suporte prioritário

### P: Como faço backup?

R: PlanetScale faz backups automáticos diariamente. Você pode acessá-los em **"Backups"** no dashboard.

### P: Posso deletar o banco de dados?

R: Sim, mas tenha cuidado! Você pode deletar em **"Settings"** → **"Delete database"**. Isso é irreversível!

### P: Qual é o limite de conexões?

R: No plano gratuito, você tem até 1000 conexões simultâneas. Mais que suficiente!

### P: Posso usar PlanetScale com Vercel?

R: Sim! É a combinação perfeita. Vercel + PlanetScale é recomendada.

## 🆘 Troubleshooting

### Erro: "Connection refused"

**Solução:**
1. Verifique se a string de conexão está correta
2. Certifique-se de que o banco de dados está criado
3. Aguarde alguns minutos (às vezes leva tempo para ativar)

### Erro: "Access denied for user"

**Solução:**
1. Verifique o nome de usuário e senha
2. Certifique-se de que o usuário foi criado
3. Tente criar um novo usuário

### Erro: "Unknown host"

**Solução:**
1. Verifique o host (deve ser `aws.connect.psdb.cloud`)
2. Certifique-se de que tem conexão com a internet
3. Tente novamente em alguns minutos

## 📞 Suporte

- **Documentação PlanetScale:** https://planetscale.com/docs
- **Discord PlanetScale:** https://discord.gg/planetscale
- **Email:** support@planetscale.com

---

**Pronto!** Você tem seu banco de dados configurado. Agora vá para o **GUIA-VERCEL.md** para fazer o deploy!
