'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShareModal from './ShareModal';

interface DocumentEditorProps {
  documentId: number;
  content: string;
  title: string;
  isSaving: boolean;
  lastSaved: Date | null;
  sharePermission: 'view' | 'edit';
  isOwner: boolean;
  isSharedAccess: boolean;
  activeUsers: any[];
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  onTitleBlur: () => void;
  onTyping?: () => void;
}

export default function DocumentEditor({
  documentId,
  content,
  title,
  isSaving,
  lastSaved,
  sharePermission,
  isOwner,
  isSharedAccess,
  activeUsers,
  onContentChange,
  onTitleChange,
  onTitleBlur,
  onTyping,
}: DocumentEditorProps) {
  const router = useRouter();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);

    // Trigger typing indicator
    if (onTyping && !isTyping) {
      setIsTyping(true);
      onTyping();
      setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    }
  };

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
                onChange={(e) => onTitleChange(e.target.value)}
                onBlur={onTitleBlur}
                disabled={sharePermission === 'view' || isSharedAccess}
                className="text-xl font-semibold border-none focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center gap-4">
              {/* Permission Badge */}
              {isSharedAccess && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    sharePermission === 'view'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {sharePermission === 'view' ? '👁️ View Only' : '✏️ Can Edit'}
                </div>
              )}

              {/* Save Status */}
              <div className="text-sm text-gray-500">
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </span>
                ) : lastSaved ? (
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                ) : null}
              </div>

              {/* Share Button - Only show for document owners */}
              {!isSharedAccess && isOwner && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share
                </button>
              )}

              {/* Active Users */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user) => (
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
        <ShareModal documentId={documentId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
