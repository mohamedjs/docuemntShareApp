'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchDocument, updateDocument } from '@/store/slices/documentSlice';
import { setActiveUsers } from '@/store/slices/collaboratorSlice';
import socketService from '@/services/socket';
import ShareModal from '@/components/ShareModal';
import api from '@/services/api';

export default function DocumentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const documentId = parseInt(resolvedParams.id);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentDocument } = useSelector((state: RootState) => state.documents);
  const { activeUsers } = useSelector((state: RootState) => state.collaborators);
  const { token } = useSelector((state: RootState) => state.auth);
  
  const searchParams = useSearchParams();
  const isSharedAccess = searchParams.get('share') === 'true';
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('edit');
  const [isOwner, setIsOwner] = useState(false);

  // Load document
  useEffect(() => {
    const loadDocument = async () => {
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
          setContent(doc.content || '');
          setTitle(doc.title || '');
          setIsOwner(false);
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
        dispatch(fetchDocument(documentId));
      }
    };
    
    loadDocument();
  }, [documentId, dispatch, token, router, isSharedAccess]);

  // Set initial content
  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content || '');
      setTitle(currentDocument.title || '');
    }
  }, [currentDocument]);

  // Socket.io connection
  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);
    socketService.joinDocument(documentId);

    // Listen for real-time updates
    socketService.onDocumentUpdated((data) => {
      if (data.document.id === documentId) {
        setContent(data.document.content || '');
      }
    });

    socketService.onUserJoined((data) => {
      if (data.activeUsers) {
        dispatch(setActiveUsers(data.activeUsers));
      }
    });

    socketService.onUserLeft((data) => {
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
  }, [documentId, token, dispatch]);

  // Auto-save with debounce
  useEffect(() => {
    if (!currentDocument || content === currentDocument.content) return;

    const timer = setTimeout(async () => {
      setIsSaving(true);
      await dispatch(updateDocument({
        id: documentId,
        data: { content }
      }));
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1000);

    return () => clearTimeout(timer);
  }, [content, currentDocument, documentId, dispatch]);

  // Handle title update
  const handleTitleBlur = async () => {
    if (title !== currentDocument?.title) {
      await dispatch(updateDocument({
        id: documentId,
        data: { title }
      }));
    }
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTyping(documentId, true);
      setTimeout(() => {
        setIsTyping(false);
        socketService.sendTyping(documentId, false);
      }, 1000);
    }
  };

  if (!currentDocument) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading document...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => router.push('/documents')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                disabled={sharePermission === 'view'}
                className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
            
            <div className="flex items-center gap-4">
              {/* Permission Badge */}
              {isSharedAccess && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sharePermission === 'view' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {sharePermission === 'view' ? '👁️ View Only' : '✏️ Can Edit'}
                </div>
              )}
              
              {/* Save Status */}
              <div className="text-sm text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                ) : null}
              </div>

              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </button>

              {/* Active Users */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user, index) => (
                    <div
                      key={user.id}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold border-2 border-white"
                      title={user.name}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[600px]">
          <textarea
            value={content}
            onChange={handleContentChange}
            disabled={sharePermission === 'view'}
            className="w-full h-full min-h-[500px] border-none focus:outline-none resize-none text-gray-800 leading-relaxed disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder={sharePermission === 'view' ? 'View only mode' : 'Start typing...'}
          />
        </div>
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          documentId={documentId}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
