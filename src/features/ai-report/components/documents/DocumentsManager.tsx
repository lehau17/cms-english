import { FileText, Upload } from 'lucide-react';
import React from 'react';

import { useDocumentUpload } from '../../hooks';
import { Card, CardHeader } from '../ui';

const DOCUMENT_TYPES = [
  { value: 'regulation', label: 'Regulation' },
  { value: 'policy', label: 'Policy' },
  { value: 'guide', label: 'Guide' },
  { value: 'faq', label: 'FAQ' },
  { value: 'manual', label: 'Manual' },
];

export const DocumentsManager: React.FC = () => {
  const { form, setForm, isUploading, handleUpload } = useDocumentUpload();

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <Card>
        <CardHeader
          title="Knowledge Base Management"
          subtitle="Upload documents to enhance the AI's knowledge base for better responses"
          icon={<FileText className="h-5 w-5" />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter document title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
              <input
                type="text"
                value={form.source}
                onChange={(e) => setForm((prev) => ({ ...prev, source: e.target.value }))}
                placeholder="e.g., Admin Department..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Enter the document content here..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload Document
            </button>
          </div>
        </div>
      </Card>

      {/* Guidelines */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Document Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Best Practices:</h4>
            <ul className="space-y-1">
              <li>- Use clear, descriptive titles</li>
              <li>- Include relevant keywords</li>
              <li>- Keep content focused and concise</li>
              <li>- Specify the source department</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Supported Types:</h4>
            <ul className="space-y-1">
              <li>- Regulations and policies</li>
              <li>- User guides and manuals</li>
              <li>- FAQ documents</li>
              <li>- Administrative procedures</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
