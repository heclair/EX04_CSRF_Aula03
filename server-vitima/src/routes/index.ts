import express, { Request, Response } from "express";
import db from "./db";

const router = express.Router();

// Simula login e define cookie de autenticação
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  const result = await db.query(
    "SELECT id FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (result.rows.length > 0) {
    res.cookie("user", result.rows[0].id, {
      sameSite: "lax",
      secure: false,
    });
    res.json({ message: "Login efetuado com sucesso" });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Rota vulnerável a CSRF via GET
router.get("/contact", async (req: Request, res: Response): Promise<void> => {
  const { name, phone } = req.query;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }
  if (!name || !phone) {
    res.status(400).json({ error: "Nome e telefone são necessários" });
    return;
  }

  console.log(`Registrando contato (via GET): ${name}, ${phone} para o usuário: ${user}`);
  await db.query(
    "INSERT INTO contacts(user_id, name, phone) VALUES($1,$2,$3)",
    [user, name, phone]
  );

  res.json({ message: "Contato registrado com sucesso" });
});

// Rota segura via POST (legítimo formulário contact.html)
router.post("/contact", async (req: Request, res: Response): Promise<void> => {
  const { name, phone } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  if (!name || !phone) {
    res.status(400).json({ error: "Nome e telefone são obrigatórios" });
    return;
  }

  try {
    console.log(`[SERVER] Registrando contato via POST: ${name}, ${phone} para o usuário: ${user}`);
    await db.query(
      "INSERT INTO contacts(user_id, name, phone) VALUES ($1, $2, $3)",
      [user, name, phone]
    );
    res.json({ message: "Contato registrado com sucesso" });
  } catch (err) {
    console.error("[SERVER] Erro ao registrar contato:", err);
    res.status(500).json({ error: "Erro ao registrar contato" });
  }
});

// Rota com verificação de ORIGIN (simula proteção simples contra CSRF)
router.post("/change-password-segura", async (req: Request, res: Response): Promise<void> => {
  const origin = req.headers.origin;

  if (!origin?.startsWith("http://localhost:3001")) {
    console.log("[SERVER] Rejeitado por origem inválida:", origin);
    res.status(403).json({ error: "Requisição inválida" });
    return;
  }

  const { password } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "Senha não fornecida" });
    return;
  }

  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    password,
    user,
  ]);
  res.json({ message: "Senha alterada com sucesso" });
});

// Rota alternativa protegida: exige senha atual
router.post("/change-password-exer03", async (req: Request, res: Response): Promise<void> => {
  const { password, currentPassword } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }
  if (!password || !currentPassword) {
    res.status(400).json({ error: "Preencha todos os campos" });
    return;
  }

  const result = await db.query(
    "SELECT * FROM users WHERE id = $1 AND password = $2",
    [user, currentPassword]
  );

  if (result.rows.length === 0) {
    res.status(403).json({ error: "Senha atual incorreta" });
    return;
  }

  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    password,
    user,
  ]);
  res.json({ message: "Senha alterada com sucesso" });
});

// Rota totalmente insegura (para testes didáticos)
router.post("/change-password-insegura", async (req: Request, res: Response): Promise<void> => {
  const { password } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
    return;
  }

  await db.query("UPDATE users SET password = $1 WHERE id = $2", [
    password,
    user,
  ]);

  console.log(`[⚠️ INSEGURA] Senha alterada para usuário ${user}`);
  res.json({ message: "Senha alterada (INSEGURA)" });
});

export default router;
