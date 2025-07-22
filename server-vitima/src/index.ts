import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import router from "./routes";
import csurf from "csurf";
import db from "./routes/db";

// Carrega variáveis de ambiente do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares essenciais
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - apenas o domínio da vítima (frontend)
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

// Middleware para CSRF (usado apenas em rotas específicas)
const csrfProtection = csurf({ cookie: true });

// Servir arquivos estáticos (HTMLs, JS, etc.)
app.use(express.static("public"));

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


// -------- ROTAS ESPECÍFICAS -------- //

// Rota que fornece o token CSRF via cookie + JSON
app.get("/csrf-protected", csrfProtection, (req: Request, res: Response) => {
  const token = req.csrfToken();
  console.log("[SERVER] Token CSRF gerado:", token);
  res.cookie("XSRF-TOKEN", token, { httpOnly: false, secure: false, sameSite: "strict" });
  res.json({ csrfToken: token });
});

// Rota protegida com middleware csurf
app.post("/change-password", csrfProtection, async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  const user = req.cookies.user;

  console.log("[SERVER] Cookie XSRF-TOKEN:", req.cookies["XSRF-TOKEN"]);
  console.log("[SERVER] Header x-csrf-token:", req.headers["x-csrf-token"]);

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

  if (req.headers["x-csrf-token"] !== req.cookies["XSRF-TOKEN"]) {
    console.log("[SERVER] ❌ Token CSRF inválido.");
    res.status(403).json({ error: "Token CSRF inválido" });
    return;
  }

  console.log("[SERVER] ✅ Token CSRF validado com sucesso.");
  await db.query("UPDATE users SET password = $1 WHERE id = $2", [password, user]);
  res.json({ message: "Senha alterada com sucesso" });
});


// -------- PÁGINAS HTML -------- //

app.get("/change-pwd", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "change-pwd.html"));
});

app.get("/home", (req, res) => {
  if (!req.cookies.user) return res.redirect("/");
  res.sendFile(path.join(__dirname, "..", "public", "home.html"));
});

app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "contact.html"));
});

app.get("/change-password", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "change-password.html"));
});

app.get("/", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});


// -------- ROTAS DO SISTEMA (seguras e inseguras) -------- //
app.use("/", router);


// -------- 404 NOT FOUND -------- //
app.use((_: Request, res: Response) => {
  res.status(404).json({ error: "Rota não encontrada" });
});
