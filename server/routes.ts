import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { z } from "zod";
import os from "os";

const api = {
  reports: {
    create: {
      path: "/api/reports",
      input: z.object({ reason: z.string() })
    }
  }
};

interface Client {
  id: string;
  ws: WebSocket;
  partnerId: string | null;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/maintenance", async (_req, res) => {
    const adminData = await storage.getAdmin();
    res.json({
      maintenanceMode: adminData?.maintenanceMode || "off",
      maintenanceMessage: adminData?.maintenanceMessage || ""
    });
  });

  app.post("/api/admin/maintenance", async (req, res) => {
    const { mode, message, password } = req.body;
    const adminData = await storage.getAdmin();
    if (adminData && adminData.password === password) {
      await storage.updateMaintenance(mode, message);
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });

  app.get("/api/admin/maintenance/history", async (_req, res) => {
    const data = await storage.getMaintenanceHistory();
    res.json(data);
  });

  app.get("/api/admin/stats", async (_req, res) => {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usage = 1 - (freeMem / totalMem);
    
    res.json({
      cpuUsage: os.loadavg()[0],
      memoryUsage: usage * 100,
      uptime: os.uptime(),
      activeConnections: clients.size
    });
  });

  app.post("/api/admin/blacklist", async (req, res) => {
    const { list, password } = req.body;
    const adminData = await storage.getAdmin();
    if (adminData && adminData.password === password) {
      await storage.updateWordBlacklist(list);
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false });
    }
  });

  // REST API
  app.post(api.reports.create.path, async (req, res) => {
    try {
      const input = api.reports.create.input.parse(req.body);
      await storage.createReport(input);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false });
    }
  });

  app.get("/api/admin/reports", async (_req, res) => {
    const data = await storage.getReports();
    res.json(data);
  });

  app.get("/api/admin/feedback", async (_req, res) => {
    const data = await storage.getFeedback();
    res.json(data);
  });

  app.post("/api/admin/login", async (req, res) => {
    const { password } = req.body;
    const adminData = await storage.getAdmin();
    if (adminData && adminData.password === password) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      await storage.createFeedback(req.body);
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ success: false });
    }
  });

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, Client>();
  const waitingQueue: string[] = [];

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(7);
    const client: Client = { id, ws, partnerId: null };
    clients.set(id, client);

    console.log(`Client connected: ${id}`);

    ws.on('message', async (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        
        switch (message.type) {
          case 'join':
            handleJoin(client);
            break;
            
          case 'next':
            handleNext(client);
            break;

          case 'typing':
            if (client.partnerId) {
              const partner = clients.get(client.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'typing',
                  isTyping: message.isTyping
                }));
              }
            }
            break;

          case 'leave':
            handleLeave(client);
            break;

          case 'signal':
            if (client.partnerId) {
              const partner = clients.get(client.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                partner.ws.send(JSON.stringify({
                  type: 'signal',
                  data: message.data
                }));
              }
            }
            break;
            
          case 'message':
             if (client.partnerId) {
              const partner = clients.get(client.partnerId);
              if (partner && partner.ws.readyState === WebSocket.OPEN) {
                const adminData = await storage.getAdmin();
                const blacklist = (adminData?.wordBlacklist || "").split(',').map(w => w.trim()).filter(w => w);
                
                let content = message.content;
                for (const word of blacklist) {
                  // Improved regex to handle common bypasses like "word123" or "word..."
                  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  // Use a more inclusive regex that matches the word even if it's part of another string
                  const regex = new RegExp(escapedWord, 'gi');
                  content = content.replace(regex, '***');
                }

                partner.ws.send(JSON.stringify({
                  type: 'message',
                  content: content
                }));
              }
            }
            break;
        }
      } catch (err) {
        console.error('WS Error:', err);
      }
    });

    ws.on('close', () => {
      handleDisconnect(client);
      broadcastUserCount();
    });

    ws.on('error', () => {
       handleDisconnect(client);
       broadcastUserCount();
    });

    broadcastUserCount();
  });

  function broadcastUserCount() {
    const count = clients.size;
    const message = JSON.stringify({ type: 'online_count', count });
    clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(message);
      }
    });
  }

  function handleJoin(client: Client) {
    console.log(`Join request from: ${client.id}`);
    // If already in queue, do nothing
    if (waitingQueue.includes(client.id)) return;
    
    // If currently paired, disconnect first
    if (client.partnerId) {
      handleDisconnect(client, false);
    }

    // Clean up queue: remove any dead clients
    while (waitingQueue.length > 0) {
      const nextId = waitingQueue[0];
      const potentialPartner = clients.get(nextId);
      
      if (potentialPartner && potentialPartner.ws.readyState === WebSocket.OPEN && nextId !== client.id) {
        // Match found
        waitingQueue.shift(); // remove from queue
        
        client.partnerId = nextId;
        potentialPartner.partnerId = client.id;

        // Notify both
        client.ws.send(JSON.stringify({ type: 'matched', initiator: true }));
        potentialPartner.ws.send(JSON.stringify({ type: 'matched', initiator: false }));
        
        console.log(`Matched ${client.id} (initiator) with ${potentialPartner.id}`);
        return;
      } else {
        // Remove dead client or self from queue
        waitingQueue.shift();
      }
    }

    // No valid partner found, join queue
    waitingQueue.push(client.id);
    client.ws.send(JSON.stringify({ type: 'waiting' }));
    console.log(`Added ${client.id} to waiting queue. Current queue length: ${waitingQueue.length}`);
  }

  function handleNext(client: Client) {
    handleLeave(client);
    // Re-join queue
    handleJoin(client);
  }

  function handleLeave(client: Client) {
    if (client.partnerId) {
      const partner = clients.get(client.partnerId);
      if (partner) {
        partner.partnerId = null;
        if (partner.ws.readyState === WebSocket.OPEN) {
          partner.ws.send(JSON.stringify({ type: 'partner_disconnected' }));
        }
      }
      client.partnerId = null;
    }
    
    // Remove from waiting queue
    const index = waitingQueue.indexOf(client.id);
    if (index !== -1) {
      waitingQueue.splice(index, 1);
    }
  }

  function handleDisconnect(client: Client, remove = true) {
    handleLeave(client);
    
    if (remove) {
      clients.delete(client.id);
      console.log(`Client disconnected: ${client.id}`);
    }
  }

  return httpServer;
}
