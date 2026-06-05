import { create } from 'zustand';

interface AppState {
  roomId: string | null;
  setRoomId: (id: string | null) => void;
  isStreaming: boolean;
  setIsStreaming: (status: boolean) => void;
  role: 'sender' | 'receiver' | null;
  setRole: (role: 'sender' | 'receiver' | null) => void;
}

export const useStore = create<AppState>((set) => ({
  roomId: null,
  setRoomId: (id) => set({ roomId: id }),
  isStreaming: false,
  setIsStreaming: (status) => set({ isStreaming: status }),
  role: null,
  setRole: (role) => set({ role }),
}));
