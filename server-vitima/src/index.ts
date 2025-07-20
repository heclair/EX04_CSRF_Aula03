import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes";
import csurf from "csurf";
import db from "./routes/db";

// Carrega as variáveis de ambiente definidas no arquivo .env
dotenv.config();

// Inicializa a aplicação Express
const app = express();

// Define a porta utilizada pelo servidor
const PORT = process.env.PORT || 3000;

// Middleware para permitir o envio de dados em formato JSON no corpo das requisições
app.use(express.json());
// Middleware para permitir o envio de dados em formato URL-encoded no corpo das requisições
app.use(express.urlencoded({ extended: true }));

// Middleware para cookies
app.use(cookieParser());

// Middleware para habilitar requisições de diferentes origens (CORS)
app.use(cors({
  origin: "http://localhost:3001", // Permite requisições apenas do domínio da vítima
  credentials: true // Permite o envio de cookies entre domínios
}));

// Inicializa o middleware csrf-csrf
const csrfProtection = csurf({ cookie: true });

// Middleware para servir arquivos estáticos a partir do diretório "public"
app.use(express.static("public"));

// Inicializa o servidor na porta definida
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// ** ROTA DE CSRF **
app.get("/csrf-protected", csrfProtection, (req: Request, res: Response) => {
  const token = req.csrfToken();
  console.log("[SERVER] Token CSRF gerado:", token);
  res.cookie('XSRF-TOKEN', token, { httpOnly: false, secure: false, sameSite: "strict" });
  res.json({ csrfToken: token });
});


// ** ROTA DE ALTERAÇÃO DE SENHA (PROTEGIDA) **
app.post("/change-password", csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  const user = req.cookies.user;

  console.log("[SERVER] Cookie recebido:", req.cookies['XSRF-TOKEN']);
  console.log("[SERVER] Header x-csrf-token:", req.headers['x-csrf-token']);

  if (!user) {
    console.log("[SERVER] Usuário não autenticado.");
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  if (!password) {
    console.log("[SERVER] Senha não fornecida.");
    res.status(400).json({ error: "Senha não fornecida" });
    return;
  }

  if (req.headers['x-csrf-token'] !== req.cookies['XSRF-TOKEN']) {
    console.log("[SERVER] ❌ Token CSRF inválido.");
    res.status(403).json({ error: "Token CSRF inválido" });
    return;
  }

  console.log("[SERVER] ✅ Token CSRF validado com sucesso. Alterando senha...");
  await db.query("UPDATE users SET password = $1 WHERE id = $2", [password, user]);
  res.json({ message: "Senha alterada com sucesso" });
});


// ** ROTA EXERCÍCIO 3 **
app.get("/change-pwd", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "change-pwd.html"));
});

// ** ROTA HOME **
app.get("/home", (req, res) => {
  if (!req.cookies.user) return res.redirect("/"); // Redireciona se o usuário não estiver autenticado
  res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

// ** OUTRAS ROTAS **
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "contact.html"));
});

app.get("/change-password", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "change-password.html"));
});

// ** ROTEADOR GERAL (MOVER APÓS AS ROTAS FIXAS) **
app.use("/", router);

// Serve a página inicial de login
app.get("/", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});


// ** MIDDLEWARE PARA 404 (Rota não encontrada) **
app.use(function (_: Request, res: Response) {
  res.status(404).json({ error: "Rota não encontrada" });
});
