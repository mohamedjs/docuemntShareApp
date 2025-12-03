import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import collaboratorReducer from './slices/collaboratorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    collaborators: collaboratorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
