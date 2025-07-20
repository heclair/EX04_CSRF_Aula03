
# 🛡️ CSRF – Demonstração de Ataque e Mitigação

Este projeto tem como objetivo demonstrar, de forma prática, a vulnerabilidade **Cross-Site Request Forgery (CSRF)** em aplicações web, além de apresentar estratégias para mitigá-la utilizando o padrão **Double Submit Cookie**.

---

## 🧩 Estrutura do Projeto

O projeto está dividido em dois servidores:

### ✅ `server-vitima`
Simula uma aplicação web real vulnerável a CSRF, contendo funcionalidades como:

- Autenticação de usuários;
- Alteração de senha (com e sem proteção CSRF);
- Registro de contatos.

Ele também demonstra como proteger rotas críticas usando o padrão **Double Submit Cookie** com as bibliotecas `csurf` e `cookie-parser`.

### 🚨 `server-ataque`
Simula o servidor de um atacante. Ele serve páginas HTML que:
- Realizam requisições maliciosas GET e POST contra o `server-vitima`;
- Testam a eficácia das proteções CSRF implementadas.

---

## 📁 Estrutura de Pastas

```
├── server-vitima/
│   ├── public/                 # Páginas HTML legítimas da aplicação
│   ├── src/
│   │   ├── routes/
│   │   │   ├── db.ts
│   │   │   └── index.ts        # Regras da aplicação
│   │   ├── comandos.sql        # Script SQL para setup do banco
│   │   └── index.ts            # Servidor Express
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
└── server-ataque/
    ├── public/                 # Páginas HTML maliciosas
    │   ├── csrf-get-attack.html
    │   ├── csrf-post-attack.html
    │   └── csrf-post-attack-seguro.html
    ├── src/
    │   └── index.ts            # Servidor do atacante
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## ▶️ Como Executar o Projeto

### 1. Instale as dependências

```bash
cd server-vitima
npm install

cd ../server-ataque
npm install
```

---

### 2. Configure o banco de dados PostgreSQL

- Crie um banco chamado `bdaula`;
- Atualize o arquivo `.env` com as credenciais corretas:

```env
PORT=3001
BD_HOST=localhost
BD_USER=postgres
BD_PASSWORD=SuaSenhaAqui
BD_DATABASE=bdaula
BD_PORT=5432
```

---

### 3. Crie as tabelas do banco

Execute os comandos SQL presentes em:

```
server-vitima/src/comandos.sql
```

---

### 4. Configure os subdomínios locais

Edite o arquivo `hosts` do seu sistema operacional:

#### Windows
```
C:\Windows\System32\drivers\etc\hosts
```

#### Linux/macOS
```bash
/etc/hosts
```

Adicione:
```
127.0.0.1   localhost
127.0.0.1   atacante.local
```

---

### 5. Inicie os servidores

Em dois terminais separados:

```bash
# Terminal 1 - Servidor vítima
cd server-vitima
npm run dev

# Terminal 2 - Servidor do atacante
cd server-ataque
npm run dev
```

---

## 🧪 Como testar e o que esperar

### 🔹 Acesse o painel do atacante

```
http://atacante.local:3002
```

Você verá uma página com 3 links de ataque:

- **Ataque GET:** simula um ataque com envio de dados via URL;
- **Ataque POST inseguro:** simula envio de formulário malicioso sem proteção;
- **Ataque POST com proteção (teste):** ataca uma rota protegida no servidor vítima.

---

### 🔹 Comportamento esperado

| Tipo de Ataque              | Proteção Ativa? | Resultado Esperado                  |
|----------------------------|------------------|-------------------------------------|
| `/csrf-get-attack`         | ❌ Não           | Contato será registrado indevidamente |
| `/csrf-post-attack`        | ❌ Não           | Senha será alterada indevidamente     |
| `/csrf-post-attack-seguro` | ✅ Sim           | Requisição será bloqueada (`403`)    |

---

### 🖥️ Monitoramento com `console.log`

Durante os testes, os servidores mostrarão mensagens no terminal:

#### No `server-vitima`

```bash
[SERVER] ✅ Token CSRF validado com sucesso.
[SERVER] Senha alterada com sucesso para usuário: 1
[SERVER] ❌ Token CSRF inválido.
[SERVER] ❌ Rejeitado por origem inválida: http://atacante.local:3002
```

#### No `server-ataque`

```bash
[SERVER-ATAQUE] Página de ataque POST inseguro acessada.
[SERVER-ATAQUE] ❌ Rota inválida acessada: GET /rota-invalida
```

---

## ✅ Proteção Implementada: Double Submit Cookie

- O servidor `server-vitima` envia o token CSRF:
  - Como cookie (`XSRF-TOKEN`);
  - E como resposta JSON visível (`/csrf-protected`);

- O front-end legítimo (ex: `change-password.html`) busca o token e envia no header `x-csrf-token`;

- O servidor compara o token enviado com o do cookie. Se forem iguais, a requisição é aceita.

---

## 👨‍💻 Desenvolvido para fins educacionais

Este projeto é apenas uma simulação para fins acadêmicos, não deve ser usado para fins maliciosos.
