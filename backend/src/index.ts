import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
// import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const httpServer = createServer(app);
// const prisma = new PrismaClient();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rooms state (in-memory for quick signaling, can be backed by DB)
const rooms = new Map<string, { sender?: string; receivers: Set<string> }>();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create or join a room
  socket.on('join-room', (roomId: string, role: 'sender' | 'receiver') => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { receivers: new Set() });
    }

    const room = rooms.get(roomId)!;
    
    if (role === 'sender') {
      room.sender = socket.id;
      // Notify receivers that sender joined
      socket.to(roomId).emit('sender-joined', socket.id);
    } else {
      room.receivers.add(socket.id);
      // Notify sender that a receiver joined
      if (room.sender) {
        io.to(room.sender).emit('receiver-joined', socket.id);
      }
    }

    console.log(`${role} ${socket.id} joined room ${roomId}`);
  });

  // WebRTC Signaling: Offer
  socket.on('offer', (payload: { target: string; offer: any }) => {
    io.to(payload.target).emit('offer', {
      caller: socket.id,
      offer: payload.offer,
    });
  });

  // WebRTC Signaling: Answer
  socket.on('answer', (payload: { target: string; answer: any }) => {
    io.to(payload.target).emit('answer', {
      caller: socket.id,
      answer: payload.answer,
    });
  });

  // WebRTC Signaling: ICE Candidate
  socket.on('ice-candidate', (payload: { target: string; candidate: any }) => {
    io.to(payload.target).emit('ice-candidate', {
      caller: socket.id,
      candidate: payload.candidate,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Clean up rooms
    for (const [roomId, room] of rooms.entries()) {
      if (room.sender === socket.id) {
        room.sender = undefined;
        socket.to(roomId).emit('sender-left', socket.id);
      }
      if (room.receivers.has(socket.id)) {
        room.receivers.delete(socket.id);
        if (room.sender) {
          io.to(room.sender).emit('receiver-left', socket.id);
        }
      }
      if (!room.sender && room.receivers.size === 0) {
        rooms.delete(roomId);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
