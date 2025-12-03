'use strict';

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: '*',
    credentials: true
}));

// Socket.io configuration
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Redis configuration
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = process.env.REDIS_PORT || 6379;
const redis = new Redis(redisPort, redisHost);

// Store active users per document
const documentRooms = new Map();

// JWT Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
        // Allow connection but mark as guest for testing
        socket.user = { id: 'guest', name: 'Guest User' };
        return next();
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        console.error('JWT verification failed:', err.message);
        socket.user = { id: 'guest', name: 'Guest User' };
        next();
    }
});

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id} (${socket.user.name || 'Unknown'})`);

    // Join document room
    socket.on('join-document', (documentId) => {
        socket.join(`document-${documentId}`);
        
        // Add user to room tracking
        if (!documentRooms.has(documentId)) {
            documentRooms.set(documentId, new Set());
        }
        documentRooms.get(documentId).add({
            id: socket.user.id,
            name: socket.user.name || 'Unknown User',
            socketId: socket.id
        });

        // Notify others in the room
        const activeUsers = Array.from(documentRooms.get(documentId));
        io.to(`document-${documentId}`).emit('user-joined', {
            user: socket.user,
            activeUsers: activeUsers
        });

        console.log(`User ${socket.user.id} joined document ${documentId}`);
    });

    // Leave document room
    socket.on('leave-document', (documentId) => {
        socket.leave(`document-${documentId}`);
        
        // Remove user from room tracking
        if (documentRooms.has(documentId)) {
            const room = documentRooms.get(documentId);
            const userArray = Array.from(room);
            const filtered = userArray.filter(u => u.socketId !== socket.id);
            documentRooms.set(documentId, new Set(filtered));

            // Notify others
            io.to(`document-${documentId}`).emit('user-left', {
                user: socket.user,
                activeUsers: filtered
            });
        }

        console.log(`User ${socket.user.id} left document ${documentId}`);
    });

    // Handle document content updates
    socket.on('document-update', (data) => {
        const { documentId, content, cursorPosition } = data;
        
        // Broadcast to all users in the room except sender
        socket.to(`document-${documentId}`).emit('document-updated', {
            content,
            cursorPosition,
            user: socket.user,
            timestamp: Date.now()
        });

        console.log(`Document ${documentId} updated by ${socket.user.id}`);
    });

    // Handle cursor position updates
    socket.on('cursor-position', (data) => {
        const { documentId, position } = data;
        
        socket.to(`document-${documentId}`).emit('cursor-moved', {
            position,
            user: socket.user,
            timestamp: Date.now()
        });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        const { documentId, isTyping } = data;
        
        socket.to(`document-${documentId}`).emit('user-typing', {
            user: socket.user,
            isTyping,
            timestamp: Date.now()
        });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.id}`);
        
        // Remove user from all document rooms
        documentRooms.forEach((users, documentId) => {
            const userArray = Array.from(users);
            const filtered = userArray.filter(u => u.socketId !== socket.id);
            documentRooms.set(documentId, new Set(filtered));

            // Notify others
            io.to(`document-${documentId}`).emit('user-left', {
                user: socket.user,
                activeUsers: filtered
            });
        });
    });
});

// Subscribe to Redis for Laravel broadcasts
redis.psubscribe('*', (err, count) => {
    if (err) {
        console.error('Failed to subscribe to Redis:', err.message);
    } else {
        console.log(`Subscribed to ${count} Redis channels`);
    }
});

// Handle Redis messages from Laravel
redis.on('pmessage', (pattern, channel, message) => {
    try {
        const event = JSON.parse(message);
        console.log('Redis event received:', event.event);
        
        // Broadcast Laravel events to Socket.io clients
        io.emit(event.event, event.data);
    } catch (err) {
        console.error('Error parsing Redis message:', err.message);
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Document Editor Socket Server',
        activeRooms: documentRooms.size,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 6002;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
    console.log(`Redis connected to ${redisHost}:${redisPort}`);
});

// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
