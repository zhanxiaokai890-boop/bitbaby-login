# Bitbaby Login

Um sistema de autenticação e verificação multi-fator robusto para plataforma de trading de criptomoedas. O projeto oferece uma interface moderna com tema escuro premium, suportando múltiplos métodos de verificação incluindo email, autenticador (2FA) e SMS.

## 🚀 Características

- **Autenticação Multi-Fator**: Suporte para Email, Autenticador (2FA) e SMS
- **Painel Administrativo**: Dashboard em tempo real para gerenciar verificações de clientes
- **Monitoramento Online/Offline**: Rastreamento de status de atividade dos clientes
- **Interface Premium**: Design escuro com acentos em amarelo, otimizado para trading
- **Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis
- **Seguro**: Autenticação JWT, validação de credenciais e proteção CSRF
- **Escalável**: Arquitetura com tRPC, React Query e Drizzle ORM

## 📋 Requisitos

- Node.js 18+ (recomendado 22+)
- pnpm 10.4.1+
- MySQL 8.0+ ou TiDB
- Git

## 🛠️ Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/bitbaby-login.git
cd bitbaby-login
```

### 2. Instalar dependências

```bash
pnpm install
```

### 3. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis necessárias:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=mysql://user:password@localhost:3306/bitbaby_login
JWT_SECRET=sua_chave_secreta_aqui
ADMIN_KEY=sua_chave_admin
OAUTH_SERVER_URL=https://seu-oauth-server.com
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_owner_id
NODE_ENV=development
```

### 4. Configurar banco de dados

```bash
# Gerar migrations
pnpm run db:push

# Ou manualmente executar migrations
drizzle-kit generate
drizzle-kit migrate
```

## 🚀 Desenvolvimento

### Iniciar servidor de desenvolvimento

```bash
pnpm run dev
```

O servidor iniciará em `http://localhost:3000` (ou próxima porta disponível).

### Compilar TypeScript

```bash
pnpm run check
```

### Executar testes

```bash
pnpm run test
```

### Formatar código

```bash
pnpm run format
```

## 📦 Build para Produção

```bash
pnpm run build
```

Isso irá:
1. Compilar o cliente React com Vite
2. Agrupar o servidor Express com esbuild
3. Gerar arquivos em `dist/`

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do seu código para GitHub
2. Conecte seu repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente no painel do Vercel
4. Vercel detectará automaticamente o projeto e fará o deploy

**Configuração necessária no Vercel:**
- Framework Preset: `Other`
- Build Command: `pnpm run build`
- Start Command: `pnpm run start`
- Output Directory: `dist`

### Netlify

1. Faça push do seu código para GitHub
2. Conecte seu repositório no [Netlify](https://netlify.com)
3. Configure as variáveis de ambiente
4. Configure o arquivo `netlify.toml`:

```toml
[build]
  command = "pnpm run build"
  functions = "dist"

[dev]
  command = "pnpm run dev"
```

### Docker

```dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
```

## 📁 Estrutura do Projeto

```
bitbaby-login/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas principais
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Context API
│   │   └── styles/        # Estilos Tailwind
│   └── public/            # Assets estáticos
├── server/                # Backend Express
│   ├── _core/            # Configurações core
│   ├── db.ts             # Funções de banco de dados
│   └── routers.ts        # Rotas tRPC
├── shared/               # Código compartilhado
├── drizzle/              # Migrations e schema
├── package.json          # Dependências
└── vite.config.ts        # Configuração Vite
```

## 🔐 Fluxo de Autenticação

### 1. Login Inicial
- Cliente insere email/senha ou número de telefone
- Servidor valida credenciais
- Cria sessão de verificação

### 2. Verificação por Email
- Cliente recebe código via email
- Insere código na página de verificação
- Código aparece no painel do admin
- Admin aprova ou rejeita

### 3. Verificação 2FA (Autenticador)
- Cliente insere código do autenticador
- Código aparece no painel do admin
- Admin aprova ou rejeita

### 4. Verificação SMS
- Admin solicita código SMS
- Cliente recebe SMS com código
- Cliente insere código
- Admin aprova ou rejeita

## 🔑 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Chave secreta para JWT | Gere com `openssl rand -base64 32` |
| `ADMIN_KEY` | Chave para acessar painel admin | `admin123` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://oauth.example.com` |
| `VITE_APP_ID` | ID da aplicação | `seu_app_id` |
| `OWNER_OPEN_ID` | OpenID do proprietário | `owner_id` |
| `NODE_ENV` | Ambiente | `development` ou `production` |

## 🧪 Testes

O projeto inclui testes unitários para funcionalidades críticas:

```bash
# Executar todos os testes
pnpm run test

# Executar com coverage
pnpm run test -- --coverage

# Modo watch
pnpm run test -- --watch
```

## 📊 Páginas Principais

### Home (`/`)
- Página inicial de login
- Formulário de autenticação
- Contador de visualizações global

### Verificação de Email (`/verify-email`)
- Entrada de código de email
- Validação em tempo real

### Verificação 2FA (`/verification`)
- Entrada de código do autenticador
- Validação de 6 dígitos

### Verificação SMS (`/verify-sms`)
- Entrada de código SMS
- Validação de 6 dígitos

### Painel Admin (`/admin`)
- Lista de clientes em tempo real
- Gerenciamento de verificações
- Contador de cliques
- Status online/offline
- Botão para limpar dados

## 🎨 Tema e Customização

O projeto usa Tailwind CSS v4 com tema escuro premium:

- **Cor primária**: Amarelo (CTAs e destaques)
- **Fundo**: Cinza escuro/preto
- **Texto**: Branco com contraste alto
- **Animações**: Framer Motion para transições suaves

Customize as cores em `client/src/styles/globals.css`.

## 🐛 Troubleshooting

### Erro: "DATABASE_URL not set"
Certifique-se de que o arquivo `.env` existe e contém `DATABASE_URL`.

### Erro: "Port already in use"
O servidor tenta usar portas 3000-3019. Se todas estiverem ocupadas, libere uma porta ou mude em `server/_core/index.ts`.

### Testes falhando
Certifique-se de que `DATABASE_URL` está configurada para executar testes com banco de dados.

## 📝 Licença

MIT

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Suporte

Para suporte, abra uma issue no repositório ou entre em contato através do email.

## 🔄 Changelog

### v1.0.0 (Atual)
- ✅ Autenticação multi-fator completa
- ✅ Painel administrativo em tempo real
- ✅ Monitoramento online/offline
- ✅ Contador de cliques e visualizações
- ✅ Interface responsiva e premium
- ✅ Testes unitários abrangentes
# Deploy com Vercel
