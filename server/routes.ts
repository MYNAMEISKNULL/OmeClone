import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

interface Client {
  id: string;
  ws: WebSocket;
  partnerId: string | null;
  interests: string[];
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
  let waitingClientId: string | null = null;

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(7);
    const client: Client = { id, ws, partnerId: null, interests: [] };
    clients.set(id, client);

    console.log(`Client connected: ${id}`);

    ws.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        
        switch (message.type) {
          case 'join':
            client.interests = message.interests || [];
            handleJoin(client);
            break;
            
          case 'next':
            client.interests = message.interests || [];
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
                partner.ws.send(JSON.stringify({
                  type: 'message',
                  content: message.content
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
    // If already waiting, do nothing
    if (waitingClientId === client.id) return;
    
    // If currently paired, disconnect first
    if (client.partnerId) {
      handleDisconnect(client, false);
    }

    // Try to find a match with shared interests
    let bestMatch: Client | null = null;
    let maxShared = -1;

    for (const [id, other] of clients) {
      if (id === client.id || other.partnerId || other.ws.readyState !== WebSocket.OPEN) continue;
      
      // Basic check: is this person in a "waiting" state? 
      // Our logic currently uses waitingClientId for the single queue.
      // Let's expand it to check anyone who is not matched.
      if (id === waitingClientId || !other.partnerId) {
        const shared = client.interests.filter(i => other.interests.includes(i)).length;
        if (shared > maxShared) {
          maxShared = shared;
          bestMatch = other;
        }
      }
    }

    if (bestMatch) {
      const partner = bestMatch;
      if (waitingClientId === partner.id) waitingClientId = null;
      
      client.partnerId = partner.id;
      partner.partnerId = client.id;

      const sharedInterests = client.interests.filter(i => partner.interests.includes(i));

      client.ws.send(JSON.stringify({ type: 'matched', initiator: true, interests: sharedInterests }));
      partner.ws.send(JSON.stringify({ type: 'matched', initiator: false, interests: sharedInterests }));
      
      console.log(`Matched ${client.id} with ${partner.id} (Shared: ${sharedInterests.join(',')})`);
    } else {
      waitingClientId = client.id;
      client.ws.send(JSON.stringify({ type: 'waiting' }));
    }
  }

  function handleNext(client: Client) {
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
    if (waitingClientId === client.id) {
      waitingClientId = null;
    }
  }

  function handleDisconnect(client: Client, remove = true) {
    if (remove) {
      clients.delete(client.id);
      console.log(`Client disconnected: ${client.id}`);
    }

    if (waitingClientId === client.id) {
      waitingClientId = null;
    }

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
  }

  return httpServer;
}
