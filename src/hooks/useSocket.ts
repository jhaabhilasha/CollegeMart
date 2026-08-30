import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

const SOCKET_URL = 'http://localhost:5000';

export function useSocket(onMessage: (msg: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth.getState();

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Join user room for targeted messaging
    if (user?.id) {
      socket.emit('join', user.id);
    }

    socket.on('receiveMessage', onMessage);

    return () => {
      socket.off('receiveMessage', onMessage);
      socket.disconnect();
    };
  }, [onMessage, user?.id]);

  const sendMessage = (msg: any) => {
    socketRef.current?.emit('sendMessage', msg);
  };

  return { sendMessage };
}
