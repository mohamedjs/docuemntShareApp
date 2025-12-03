import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  name: string;
  socketId?: string;
}

interface CollaboratorState {
  activeUsers: User[];
  userPresence: { [documentId: number]: User[] };
}

const initialState: CollaboratorState = {
  activeUsers: [],
  userPresence: {},
};

const collaboratorSlice = createSlice({
  name: 'collaborators',
  initialState,
  reducers: {
    setActiveUsers: (state, action: PayloadAction<User[]>) => {
      state.activeUsers = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      const exists = state.activeUsers.find(u => u.id === action.payload.id);
      if (!exists) {
        state.activeUsers.push(action.payload);
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.activeUsers = state.activeUsers.filter(u => u.id !== action.payload);
    },
    setDocumentPresence: (state, action: PayloadAction<{ documentId: number; users: User[] }>) => {
      state.userPresence[action.payload.documentId] = action.payload.users;
    },
  },
});

export const { setActiveUsers, addUser, removeUser, setDocumentPresence } = collaboratorSlice.actions;
export default collaboratorSlice.reducer;
