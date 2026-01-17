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
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // WebSocket Server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, Client>();
  let waitingClientId: string | null = null;

  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(7);
    const client: Client = { id, ws, partnerId: null };
    clients.set(id, client);

    console.log(`Client connected: ${id}`);

    ws.on('message', (rawMessage) => {
      try {
        const message = JSON.parse(rawMessage.toString());
        
        switch (message.type) {
          case 'join':
            handleJoin(client);
            break;
            
          case 'next':
            handleNext(client);
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
    });

    ws.on('error', () => {
       handleDisconnect(client);
    });
  });

  function handleJoin(client: Client) {
    // If already waiting, do nothing
    if (waitingClientId === client.id) return;
    
    // If currently paired, disconnect first (shouldn't happen with proper frontend logic, but safety)
    if (client.partnerId) {
      handleDisconnect(client, false); // Don't remove from clients map
    }

    if (waitingClientId) {
      const partnerId = waitingClientId;
      const partner = clients.get(partnerId);

      if (partner && partner.ws.readyState === WebSocket.OPEN && partnerId !== client.id) {
        // Match found
        waitingClientId = null;
        
        client.partnerId = partnerId;
        partner.partnerId = client.id;

        // Notify both
        client.ws.send(JSON.stringify({ type: 'matched', initiator: true }));
        partner.ws.send(JSON.stringify({ type: 'matched', initiator: false }));
        
        console.log(`Matched ${client.id} with ${partner.id}`);
      } else {
        // Partner gone, become waiting
        waitingClientId = client.id;
        client.ws.send(JSON.stringify({ type: 'waiting' }));
      }
    } else {
      // No one waiting
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
