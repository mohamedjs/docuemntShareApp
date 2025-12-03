import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

interface Document {
  id: number;
  title: string;
  content: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: any;
  collaborators?: any[];
}

interface DocumentVersion {
  id: number;
  document_id: number;
  content: string;
  user_id: number;
  version_number: number;
  created_at: string;
}

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  versions: DocumentVersion[];
  loading: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  versions: [],
  loading: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  'documents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch documents');
    }
  }
);

export const fetchDocument = createAsyncThunk(
  'documents/fetchOne',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch document');
    }
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async (data: { title: string; content?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/documents', data);
      return response.data.document;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || 'Failed to create document');
    }
  }
);

export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ id, data }: { id: number; data: Partial<Document> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/documents/${id}`, data);
      return response.data.document;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.errors || 'Failed to update document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await api.delete(`/documents/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete document');
    }
  }
);

export const fetchVersions = createAsyncThunk(
  'documents/fetchVersions',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.get(`/documents/${id}/versions`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch versions');
    }
  }
);

const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    setCurrentDocument: (state, action: PayloadAction<Document | null>) => {
      state.currentDocument = action.payload;
    },
    updateDocumentContent: (state, action: PayloadAction<{ id: number; content: string }>) => {
      if (state.currentDocument && state.currentDocument.id === action.payload.id) {
        state.currentDocument.content = action.payload.content;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.currentDocument = action.payload;
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.documents[index] = action.payload;
        }
        if (state.currentDocument?.id === action.payload.id) {
          state.currentDocument = action.payload;
        }
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(d => d.id !== action.payload);
      })
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.versions = action.payload;
      });
  },
});

export const { setCurrentDocument, updateDocumentContent } = documentSlice.actions;
export default documentSlice.reducer;
