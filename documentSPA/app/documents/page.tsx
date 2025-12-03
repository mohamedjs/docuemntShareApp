'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchDocuments, createDocument } from '@/store/slices/documentSlice';
import { getMe, logout } from '@/store/slices/authSlice';

export default function DocumentsPage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { documents, loading } = useSelector((state: RootState) => state.documents);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    dispatch(getMe());
    dispatch(fetchDocuments());
  }, [dispatch, router]);

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;
    const result = await dispatch(createDocument({ title: newDocTitle, content: '' }));
    if (createDocument.fulfilled.match(result)) {
      setShowCreateModal(false);
      setNewDocTitle('');
      router.push(`/documents/${result.payload.id}`);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    router.push('/login');
  };

  if (!isAuthenticated && !loading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl"
          >
            + New Document
          </button>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No documents yet</p>
            <p className="text-sm text-gray-500">Create your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/documents/${doc.id}`)}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-200 hover:border-indigo-300"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {doc.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Updated {new Date(doc.updated_at).toLocaleDateString()}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {doc.collaborators?.length || 0} collaborators
                  </span>
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create New Document</h2>
            <input
              type="text"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              placeholder="Document title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateDocument()}
              autoFocus
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDocument}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
