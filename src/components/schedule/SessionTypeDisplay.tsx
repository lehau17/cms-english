import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { SessionType, getSessionTypeIcon, getSessionTypeColor, getSessionTypeLabel } from '@/utils/session-type-helpers';

interface SessionTypeDisplayProps {
  type: SessionType;
  meetingUrl?: string | null;
  showLink?: boolean;
  compact?: boolean;
}

const SessionTypeDisplay: React.FC<SessionTypeDisplayProps> = ({
  type,
  meetingUrl,
  showLink = true,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);
  const Icon = getSessionTypeIcon(type);
  const colorClass = getSessionTypeColor(type);
  const label = getSessionTypeLabel(type);

  const copyToClipboard = async () => {
    if (meetingUrl) {
      try {
        await navigator.clipboard.writeText(meetingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className={compact ? '' : 'space-y-2'}>
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>

      {showLink && type === 'online' && meetingUrl && (
        <div className="mt-2 space-y-1">
          <label className="block text-xs font-medium text-gray-700">Meeting Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={meetingUrl}
              readOnly
              className="flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-gray-50 text-gray-700 cursor-text"
            />
            <button
              type="button"
              onClick={copyToClipboard}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Copy link"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => window.open(meetingUrl, '_blank')}
              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTypeDisplay;
