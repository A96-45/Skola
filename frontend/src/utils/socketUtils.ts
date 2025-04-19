// Mock Socket.io client implementation
export interface MockSocket {
  id: string;
  connected: boolean;
  disconnect: () => void;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string) => void;
}

let socket: MockSocket | null = null;

// Create a mock socket implementation
export const getSocket = (): MockSocket => {
  if (!socket) {
    socket = {
      id: `mock-socket-${Date.now()}`,
      connected: true,
      disconnect: () => {
        if (socket) {
          socket.connected = false;
          console.log('Mock socket disconnected');
        }
      },
      emit: (event, ...args) => {
        console.log(`Mock socket emitting event: ${event}`, args);
      },
      on: (event, callback) => {
        console.log(`Mock socket registered handler for event: ${event}`);
      },
      off: (event) => {
        console.log(`Mock socket removed handler for event: ${event}`);
      }
    };
    console.log('Mock socket connected');
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinUniversity = (userId: string, universityId: string): void => {
  const socket = getSocket();
  socket.emit('joinUniversity', { userId, universityId });
};

export const joinCourse = (userId: string, universityId: string, courseId: string): void => {
  const socket = getSocket();
  socket.emit('joinCourse', { userId, universityId, courseId });
};

export const leaveCourse = (userId: string, universityId: string, courseId: string): void => {
  const socket = getSocket();
  socket.emit('leaveCourse', { userId, universityId, courseId });
};
