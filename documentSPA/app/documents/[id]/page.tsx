'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { setActiveUsers } from '@/store/slices/collaboratorSlice';
import socketService from '@/services/socket';
import DocumentEditor from '@/components/DocumentEditor';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';

export default function DocumentEditorPage({ params }: { params: { id: string } }) {
  const documentId = parseInt(params.id);
  const dispatch = useDispatch<AppDispatch>();
  const { currentDocument } = useSelector((state: RootState) => state.documents);
  const { activeUsers } = useSelector((state: RootState) => state.collaborators);
  const { token } = useSelector((state: RootState) => state.auth);
  
  const searchParams = useSearchParams();
  const isSharedAccess = searchParams.get('share') === 'true';

  // Use the custom hook for document management
  const {
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
  } = useDocumentEditor({
    documentId,
    isSharedAccess,
    token,
    currentDocument,
  });

  // Socket.io connection for real-time collaboration
  useEffect(() => {
    // Connect with token if available, otherwise as guest for shared access
    const connectionToken = token || 'guest';
    const socket = socketService.connect(connectionToken);
    socketService.joinDocument(documentId);

    // Listen for real-time updates from other users
    socketService.onDocumentUpdated((data) => {
      console.log('Document updated by another user:', data);
      if (data.content !== undefined) {
        setContent(data.content);
      }
    });

    socketService.onUserJoined((data) => {
      console.log('User joined:', data);
      if (data.activeUsers) {
        dispatch(setActiveUsers(data.activeUsers));
      }
    });

    socketService.onUserLeft((data) => {
      console.log('User left:', data);
      if (data.activeUsers) {
        dispatch(setActiveUsers(data.activeUsers));
      }
    });

    return () => {
      socketService.leaveDocument(documentId);
      socketService.off('document-updated');
      socketService.off('user-joined');
      socketService.off('user-left');
    };
  }, [documentId, token, dispatch, setContent]);

  // Handle typing indicator
  const handleTyping = () => {
    socketService.sendTyping(documentId, true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-lg text-gray-700">Loading document...</p>
        </div>
      </div>
    );
  }

  // Check if document exists
  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">Document not found</p>
      </div>
    );
  }

  // Handle content change and broadcast to other users
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    // Broadcast content change to other users via socket (for real-time updates)
    socketService.sendDocumentUpdate(documentId, newContent);
  };

  return (
    <DocumentEditor
      documentId={documentId}
      content={content}
      title={title}
      isSaving={isSaving}
      lastSaved={lastSaved}
      sharePermission={sharePermission}
      isOwner={isOwner}
      isSharedAccess={isSharedAccess}
      activeUsers={activeUsers}
      onContentChange={handleContentChange}
      onTitleChange={setTitle}
      onTitleBlur={handleTitleUpdate}
      onTyping={handleTyping}
    />
  );
}
