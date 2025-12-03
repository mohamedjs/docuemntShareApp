import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://document-socket.local';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinDocument(documentId: number) {
    this.socket?.emit('join-document', documentId);
  }

  leaveDocument(documentId: number) {
    this.socket?.emit('leave-document', documentId);
  }

  sendDocumentUpdate(documentId: number, content: string, cursorPosition?: any) {
    this.socket?.emit('document-update', {
      documentId,
      content,
      cursorPosition,
    });
  }

  sendCursorPosition(documentId: number, position: any) {
    this.socket?.emit('cursor-position', {
      documentId,
      position,
    });
  }

  sendTyping(documentId: number, isTyping: boolean) {
    this.socket?.emit('typing', {
      documentId,
      isTyping,
    });
  }

  onDocumentUpdated(callback: (data: any) => void) {
    this.socket?.on('document-updated', callback);
  }

  onUserJoined(callback: (data: any) => void) {
    this.socket?.on('user-joined', callback);
  }

  onUserLeft(callback: (data: any) => void) {
    this.socket?.on('user-left', callback);
  }

  onCursorMoved(callback: (data: any) => void) {
    this.socket?.on('cursor-moved', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user-typing', callback);
  }

  off(event: string, callback?: any) {
    this.socket?.off(event, callback);
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
