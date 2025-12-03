'use client';

import { useState } from 'react';
import api from '@/services/api';

interface ShareModalProps {
  documentId: number;
  onClose: () => void;
}

export default function ShareModal({ documentId, onClose }: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit'>('edit');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await api.post(`/documents/${documentId}/share`, {
        permission,
        expires_in_days: expiresInDays || undefined,
      });
      
      setShareUrl(response.data.share_url);
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  const revokeShareLink = async () => {
    setLoading(true);
    try {
      await api.delete(`/documents/${documentId}/share`);
      setShareUrl('');
      alert('Share link revoked successfully');
    } catch (error) {
      console.error('Failed to revoke share link:', error);
      alert('Failed to revoke share link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Share Document</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permission
              </label>
              <select
                value={permission}
                onChange={(e) => setPermission(e.target.value as 'view' | 'edit')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="edit">Can Edit</option>
                <option value="view">View Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expires In (days)
              </label>
              <input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Never expires"
                min="1"
                max="365"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty for no expiration</p>
            </div>

            <button
              onClick={generateShareLink}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Permission:</strong> {permission === 'edit' ? 'Can Edit' : 'View Only'}
              </p>
              {expiresInDays && (
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Expires:</strong> In {expiresInDays} days
                </p>
              )}
            </div>

            <button
              onClick={revokeShareLink}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
            >
              {loading ? 'Revoking...' : 'Revoke Share Link'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
