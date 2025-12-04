import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchDocument, updateDocument } from '@/store/slices/documentSlice';
import api from '@/services/api';

interface UseDocumentEditorProps {
  documentId: number;
  isSharedAccess: boolean;
  token: string | null;
  currentDocument: any;
}

export const useDocumentEditor = ({
  documentId,
  isSharedAccess,
  token,
  currentDocument,
}: UseDocumentEditorProps) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('edit');
  const [isOwner, setIsOwner] = useState(false);
  const [sharedDocument, setSharedDocument] = useState<any>(null);

  // Get the current document (either shared or normal)
  const document = isSharedAccess ? sharedDocument : currentDocument;

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
      setIsLoading(true);

      if (isSharedAccess) {
        // Load via share token (no auth required)
        const shareToken = sessionStorage.getItem('shareToken');
        const permission = sessionStorage.getItem('sharePermission') as 'view' | 'edit';

        if (!shareToken) {
          router.push('/login');
          return;
        }

        setSharePermission(permission || 'edit');

        try {
          const response = await api.get(`/share/${shareToken}`);
          const doc = response.data;
          setSharedDocument(doc);
          setContent(doc.content || '');
          setTitle(doc.title || '');
          setIsOwner(false);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to load shared document:', error);
          router.push('/login');
        }
      } else {
        // Normal authenticated access
        if (!token) {
          router.push('/login');
          return;
        }

        try {
          await dispatch(fetchDocument(documentId));
          setIsOwner(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to load document:', error);
          setIsLoading(false);
        }
      }
    };

    loadDocument();
  }, [documentId, dispatch, token, router, isSharedAccess]);

  // Set initial content for normal (non-shared) documents
  useEffect(() => {
    if (!isSharedAccess && currentDocument) {
      setContent(currentDocument.content || '');
      setTitle(currentDocument.title || '');
    }
  }, [currentDocument, isSharedAccess]);

  // Auto-save with debounce (works for both shared and normal access)
  useEffect(() => {
    // Skip auto-save for view-only permission
    if (sharePermission === 'view') return;

    // Skip if no content change
    if (isSharedAccess) {
      if (!sharedDocument || content === sharedDocument?.content) return;
    } else {
      if (!currentDocument || content === currentDocument?.content) return;
    }

    const timer = setTimeout(async () => {
      setIsSaving(true);

      try {
        if (isSharedAccess) {
          // For shared access, update via share token endpoint
          const shareToken = sessionStorage.getItem('shareToken');
          if (shareToken) {
            await api.put(`/share/${shareToken}`, { content });
            // Update local shared document state
            setSharedDocument({ ...sharedDocument, content });
          }
        } else {
          // For authenticated users, update via normal endpoint
          // This will trigger Laravel broadcast event via Redis
          await dispatch(
            updateDocument({
              id: documentId,
              data: { content },
            })
          );
        }
        
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, currentDocument, sharedDocument, documentId, dispatch, isSharedAccess, sharePermission]);

  // Handle title update (only for normal authenticated access)
  const handleTitleUpdate = async (newTitle: string) => {
    if (isSharedAccess) return; // No title updates for shared access
    if (newTitle !== currentDocument?.title) {
      await dispatch(
        updateDocument({
          id: documentId,
          data: { title: newTitle },
        })
      );
    }
  };

  return {
    content,
    setContent,
    title,
    setTitle,
    isSaving,
    lastSaved,
    isLoading,
    sharePermission,
    isOwner,
    document,
    handleTitleUpdate,
  };
};
