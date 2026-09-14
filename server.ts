import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { parserEngine } from './server/parserEngine';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // PARSER API ROUTES
  // -------------------------------------------------------------

  // 1. Get all accounts for parsing
  app.get('/api/parser/accounts', (req, res) => {
    const accounts = parserEngine.getAccounts();
    res.json({ success: true, accounts });
  });

  // 2. Add or update parser account
  app.post('/api/parser/accounts', (req, res) => {
    const { id, username, password, twoFactorSecret, proxy, notes } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'Логин (username) обязателен' });
    }

    const accounts = parserEngine.getAccounts();
    const cleanUsername = username.trim().replace(/^@/, '');

    if (id) {
      // Update existing
      const idx = accounts.findIndex((a) => a.id === id);
      if (idx >= 0) {
        accounts[idx] = {
          ...accounts[idx],
          username: cleanUsername,
          ...(password !== undefined ? { password } : {}),
          ...(twoFactorSecret !== undefined ? { twoFactorSecret } : {}),
          proxy: proxy || '',
          notes: notes || '',
          updatedAt: new Date().toISOString(),
        };
        parserEngine.saveAccounts(accounts);
        return res.json({ success: true, account: accounts[idx] });
      }
    }

    // Create new
    const newAccount = {
      id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      username: cleanUsername,
      password: password || '',
      twoFactorSecret: twoFactorSecret || '',
      proxy: proxy || '',
      status: 'needs_auth' as const,
      sessionExists: false,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    accounts.push(newAccount);
    parserEngine.saveAccounts(accounts);
    res.json({ success: true, account: newAccount });
  });

  // 3. Delete parser account
  app.delete('/api/parser/accounts/:id', (req, res) => {
    const { id } = req.params;
    const accounts = parserEngine.getAccounts();
    const filtered = accounts.filter((a) => a.id !== id);
    parserEngine.saveAccounts(filtered);
    res.json({ success: true });
  });

  // 4. Authenticate / Verify parser account via Playwright
  app.post('/api/parser/accounts/:id/auth', async (req, res) => {
    const { id } = req.params;
    const accounts = parserEngine.getAccounts();
    const account = accounts.find((a) => a.id === id);
    if (!account) {
      return res.status(404).json({ success: false, error: 'Аккаунт не найден' });
    }

    // Trigger authentication asynchronously or await result
    try {
      const result = await parserEngine.authenticateAccount(account);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Get Staging Contacts (Промежуточная база контактов)
  app.get('/api/parser/staging', (req, res) => {
    const contacts = parserEngine.getStagingContacts();
    res.json({ success: true, contacts });
  });

  // 6. Delete a single contact from staging (Исключить)
  app.delete('/api/parser/staging/:id', (req, res) => {
    const { id } = req.params;
    const contacts = parserEngine.getStagingContacts();
    const filtered = contacts.filter((c) => c.id !== id);
    parserEngine.saveStagingContacts(filtered);
    res.json({ success: true });
  });

  // 7. Clear entire staging database
  app.post('/api/parser/staging/clear', (req, res) => {
    parserEngine.saveStagingContacts([]);
    parserEngine.addLog('info', 'Промежуточная база контактов очищена');
    res.json({ success: true });
  });

  // 8. Start Parser Task
  app.post('/api/parser/start', async (req, res) => {
    const { config, existingCrmUsernames } = req.body;
    if (!config) {
      return res.status(400).json({ success: false, error: 'Конфигурация задачи обязательна' });
    }

    const started = await parserEngine.startJob(config, existingCrmUsernames || []);
    if (!started) {
      return res.status(400).json({
        success: false,
        error: 'Парсер уже запущен или не может быть инициализирован',
      });
    }

    res.json({ success: true, status: parserEngine.getStatus() });
  });

  // 9. Stop Parser Task
  app.post('/api/parser/stop', async (req, res) => {
    await parserEngine.stopJob();
    res.json({ success: true, status: parserEngine.getStatus() });
  });

  // 10. Get current status & logs
  app.get('/api/parser/status', (req, res) => {
    res.json({ success: true, status: parserEngine.getStatus() });
  });

  // 11. Server-Sent Events (SSE) for Real-time Parser Streaming
  app.get('/api/parser/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Send initial status
    sendEvent({ type: 'status', payload: parserEngine.getStatus() });

    parserEngine.addSseClient(sendEvent);

    req.on('close', () => {
      parserEngine.removeSseClient(sendEvent);
      res.end();
    });
  });

  // -------------------------------------------------------------
  // VITE & STATIC FILES MIDDLEWARE
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
