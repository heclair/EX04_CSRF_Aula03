import express, { Request, Response, NextFunction } from "express";

import dotenv from "dotenv";
import path from "path";

// Carrega as variáveis de ambiente do .env
dotenv.config();

// Inicializa o app
const app = express();
const PORT = process.env.PORT || 3002;

// Diretório de arquivos públicos
const publicPath = path.join(__dirname, "..", "public");

// Middleware para servir arquivos estáticos (favicon, imagens etc.)
app.use(express.static(publicPath));

// Middleware para ignorar acessos automáticos indesejados
app.use((req: Request, res: Response, next: NextFunction): void => {
  const ignoredPaths = ["/favicon.ico", "/.well-known/appspecific/com.chrome.devtools.json"];
  
  if (ignoredPaths.includes(req.path)) {
    res.status(204).end(); // simplesmente finaliza, sem retorno
    return;
  }

  next();
});

// ****** Página inicial ******
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

// ****** Rotas para páginas HTML específicas ******
app.get("/csrf-get-attack", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque GET acessada.");
  res.sendFile(path.join(publicPath, "csrf-get-attack.html"));
});

app.get("/csrf-post-attack", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque POST inseguro acessada.");
  res.sendFile(path.join(publicPath, "csrf-post-attack.html"));
});

app.get("/csrf-post-attack-seguro", (_: Request, res: Response) => {
  console.log("[SERVER-ATAQUE] Página de ataque POST seguro (com simulação de proteção) acessada.");
  res.sendFile(path.join(publicPath, "csrf-post-attack-seguro.html"));
});

// ****** Rota 404 padrão ******
app.use((req: Request, res: Response) => {
  console.log(`[SERVER-ATAQUE] ❌ Rota inválida acessada: ${req.method} ${req.url}`);
  res.status(404).json({ error: "Rota não encontrada" });
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
