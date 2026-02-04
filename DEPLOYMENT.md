# Guia de Deployment - Bitbaby Login

Este documento fornece instruções detalhadas para fazer deploy da aplicação em diferentes plataformas.

## 📋 Pré-requisitos

- Node.js 18+ (recomendado 22+)
- pnpm 10.4.1+
- Banco de dados MySQL 8.0+ ou TiDB
- Git
- Conta em uma plataforma de hospedagem (Vercel, Netlify, etc.)

## 🚀 Deploy em Vercel (Recomendado)

Vercel é a plataforma recomendada para este projeto, pois oferece suporte nativo para Node.js e integração perfeita com GitHub.

### Passo 1: Preparar o repositório

```bash
# Certifique-se de que o código está em um repositório GitHub
git remote add origin https://github.com/seu-usuario/bitbaby-login.git
git push -u origin main
```

### Passo 2: Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Clique em "Import"

### Passo 3: Configurar variáveis de ambiente

No painel do Vercel, vá para "Settings" → "Environment Variables" e adicione:

```
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=sua_chave_secreta_gerada_com_openssl_rand_-base64_32
ADMIN_KEY=sua_chave_admin_segura
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_owner_id
OAUTH_SERVER_URL=https://seu-oauth-server.com
BUILT_IN_FORGE_API_URL=https://api.example.com
BUILT_IN_FORGE_API_KEY=sua_chave_api
NODE_ENV=production
```

### Passo 4: Configurar banco de dados

Você pode usar:

- **PlanetScale** (MySQL serverless) - Recomendado
- **AWS RDS** (MySQL gerenciado)
- **DigitalOcean Managed Databases**
- **Seu próprio servidor MySQL**

#### Exemplo com PlanetScale:

1. Crie uma conta em [planetscale.com](https://planetscale.com)
2. Crie um novo banco de dados
3. Copie a string de conexão
4. Adicione como `DATABASE_URL` no Vercel

### Passo 5: Deploy

O Vercel fará deploy automaticamente quando você fazer push para a branch principal.

Para fazer deploy manual:

```bash
npm install -g vercel
vercel
```

### Verificar o deploy

```bash
# Acessar a URL do projeto
https://seu-projeto.vercel.app

# Verificar logs
vercel logs
```

## 🚀 Deploy em Netlify

### Passo 1: Conectar repositório

1. Acesse [netlify.com](https://netlify.com)
2. Clique em "New site from Git"
3. Selecione seu repositório GitHub
4. Clique em "Connect"

### Passo 2: Configurar build

Netlify detectará automaticamente o arquivo `netlify.toml`. Verifique as configurações:

- **Build command**: `pnpm run build`
- **Publish directory**: `dist/public`
- **Functions directory**: `dist`

### Passo 3: Adicionar variáveis de ambiente

Em "Site settings" → "Build & deploy" → "Environment", adicione as mesmas variáveis que no Vercel.

### Passo 4: Deploy

Clique em "Deploy site". Netlify fará deploy automaticamente a cada push.

## 🐳 Deploy com Docker

### Passo 1: Construir imagem

```bash
docker build -t bitbaby-login:latest .
```

### Passo 2: Executar container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:3306/database" \
  -e JWT_SECRET="sua_chave_secreta" \
  -e ADMIN_KEY="admin123" \
  -e NODE_ENV="production" \
  bitbaby-login:latest
```

### Passo 3: Deploy em serviço de container

#### AWS ECS

```bash
# Fazer push para ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag bitbaby-login:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bitbaby-login:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/bitbaby-login:latest

# Criar task definition e service
# (Consulte documentação AWS ECS)
```

#### Google Cloud Run

```bash
# Fazer push para Container Registry
docker tag bitbaby-login:latest gcr.io/seu-projeto/bitbaby-login:latest
docker push gcr.io/seu-projeto/bitbaby-login:latest

# Deploy
gcloud run deploy bitbaby-login \
  --image gcr.io/seu-projeto/bitbaby-login:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL="mysql://...",JWT_SECRET="..."
```

#### DigitalOcean App Platform

1. Conecte seu repositório GitHub
2. Selecione "Dockerfile" como source
3. Configure variáveis de ambiente
4. Clique em "Deploy"

## 🖥️ Deploy em servidor próprio (VPS)

### Passo 1: Preparar servidor

```bash
# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Instalar Nginx (reverse proxy)
sudo apt-get install -y nginx
```

### Passo 2: Clonar e configurar projeto

```bash
cd /var/www
git clone https://github.com/seu-usuario/bitbaby-login.git
cd bitbaby-login

# Instalar dependências
pnpm install --prod

# Criar arquivo .env
cp .env.example .env
# Editar .env com suas configurações
nano .env

# Compilar projeto
pnpm run build
```

### Passo 3: Configurar PM2

```bash
# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bitbaby-login',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Passo 4: Configurar Nginx

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/bitbaby-login
```

Adicione:

```nginx
upstream bitbaby {
  server localhost:3000;
}

server {
  listen 80;
  server_name seu-dominio.com;

  location / {
    proxy_pass http://bitbaby;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/bitbaby-login /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 5: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Gerar certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo systemctl enable certbot.timer
```

## 📊 Monitoramento

### Vercel

- Acesse o dashboard do Vercel para ver logs e métricas
- Configure alertas em "Settings" → "Alerts"

### Netlify

- Acesse o dashboard do Netlify para ver logs
- Configure notificações em "Site settings" → "Notifications"

### Servidor próprio

```bash
# Ver logs do PM2
pm2 logs bitbaby-login

# Ver status
pm2 status

# Monitorar em tempo real
pm2 monit
```

## 🔄 Atualizações e Rollback

### Vercel

```bash
# Fazer push para atualizar
git push origin main

# Rollback para versão anterior
# Use o painel do Vercel: Deployments → Select version → Promote to Production
```

### Servidor próprio

```bash
# Atualizar código
git pull origin main

# Recompilar
pnpm run build

# Reiniciar aplicação
pm2 restart bitbaby-login
```

## 🚨 Troubleshooting

### Erro: "DATABASE_URL not set"

Certifique-se de que a variável de ambiente está configurada na plataforma de deployment.

### Erro: "Port already in use"

Verifique se outra aplicação está usando a porta 3000 ou configure uma porta diferente.

### Erro: "Cannot find module"

```bash
# Reinstalar dependências
pnpm install --prod

# Recompilar
pnpm run build
```

### Aplicação lenta

- Verifique a conexão com o banco de dados
- Aumente a memória alocada
- Habilite caching de assets estáticos
- Use CDN para servir arquivos estáticos

## 📞 Suporte

Para problemas específicos da plataforma:

- **Vercel**: https://vercel.com/support
- **Netlify**: https://support.netlify.com
- **AWS**: https://aws.amazon.com/support
- **Google Cloud**: https://cloud.google.com/support
- **DigitalOcean**: https://www.digitalocean.com/support

## ✅ Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados criado e acessível
- [ ] Migrations executadas (`pnpm run db:push`)
- [ ] Código compilado sem erros (`pnpm run check`)
- [ ] Testes passando (`pnpm run test`)
- [ ] Build bem-sucedido (`pnpm run build`)
- [ ] Arquivo `.env` não está no repositório
- [ ] Domínio configurado (se aplicável)
- [ ] SSL/HTTPS ativado
- [ ] Logs configurados para monitoramento
- [ ] Backups do banco de dados configurados
- [ ] Plano de disaster recovery definido
