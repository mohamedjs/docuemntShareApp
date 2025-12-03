'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedDocument = async () => {
      try {
        // Fetch document by share token (no auth required!)
        const response = await api.get(`/share/${token}`);
        const document = response.data;

        // Store share token in sessionStorage for editor access
        sessionStorage.setItem('shareToken', token);
        sessionStorage.setItem('sharePermission', document.share_permission);

        // Redirect to document editor
        router.push(`/documents/${document.id}?share=true`);
      } catch (err: any) {
        console.error('Failed to load shared document:', err);
        if (err.response?.status === 404) {
          setError('This share link is invalid or has expired.');
        } else {
          setError('Failed to load shared document. Please try again.');
        }
        setLoading(false);
      }
    };

    fetchSharedDocument();
  }, [token, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Loading Shared Document</h2>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
