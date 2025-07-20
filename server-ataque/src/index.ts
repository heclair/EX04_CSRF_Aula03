import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis de ambiente definidas no arquivo .env
dotenv.config();

// Inicializa a aplicação Express
const app = express();

// Define a porta utilizada pelo servidor
const PORT = process.env.PORT || 3000;

// Inicializa o servidor na porta definida
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// ****** ROTA INICIAL (http://localhost:3002) ******
app.get("/", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Acessando página inicial com os exemplos de ataque.");
  res.send(`
    <h1>Simulador de Ataques CSRF</h1>
    <ul>
      <li><a href="/csrf-get-attack">🔗 Ataque GET</a></li>
      <li><a href="/csrf-post-attack">📤 Ataque POST Inseguro</a></li>
      <li><a href="/csrf-post-attack-seguro">🛡️ Ataque POST Simulado Seguro</a></li>
    </ul>
  `);
});

// ****** ROTAS PARA PÁGINAS HTML ESTÁTICAS ******
app.get("/csrf-get-attack", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque GET acessada.");
  res.sendFile(path.join(__dirname, "..", "public", "csrf-get-attack.html"));
});

app.get("/csrf-post-attack", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque POST inseguro acessada.");
  res.sendFile(path.join(__dirname, "..", "public", "csrf-post-attack.html"));
});

app.get("/csrf-post-attack-seguro", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque POST seguro (com simulação de proteção) acessada.");
  res.sendFile(path.join(__dirname, "..", "public", "csrf-post-attack-seguro.html"));
});

// ****** ROTA 404 PADRÃO ******
app.use(function (req: Request, res: Response) {
  console.log(`[SERVER-ATAQUE] ❌ Rota inválida acessada: ${req.method} ${req.url}`);
  console.log(`[SERVER-ATAQUE] Esta rota não está implementada. Redirecione para '/' ou páginas de teste específicas.`);
  res.status(404).json({ error: "Rota não encontrada" });
});
