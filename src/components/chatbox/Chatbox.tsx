import { useState } from 'react';
import type { ChatChannel, ChatMessage } from '../../types/chatbox';
import { useAuth } from '../../context/AuthContext';
import ChatLog from './ChatLog';
import ChatControls from './ChatControls';
import ReportModal from './ReportModal';
import mockMessages from './mockMessages';
import './Chatbox.css';

/** The chat-input look-alike pinned under the divider — purely decorative for now, no typing. */
function ChatInputRow() {
  const { user } = useAuth();
  const name = user?.username ?? 'ardy hosts';

  return (
    <div className="chat-input-row">
      <span className="chat-input-text">
        {name}: <span className="chat-input-cursor">*</span>
      </span>
    </div>
  );
}

interface Props {
  /** Defaults to placeholder sample data until this is wired up to a live OSRS chat feed. */
  messages?: ChatMessage[];
  className?: string;
}

export default function Chatbox({ messages = mockMessages, className }: Props) {
  const [channel, setChannel] = useState<ChatChannel>('all');
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className={`chatbox ${className ?? ''}`}>
      <div className="chat-window">
        <div className="chat-window-body">
          <ChatLog messages={messages} />
        </div>
        <ChatInputRow />
      </div>
      <ChatControls selected={channel} onSelect={setChannel} onReport={() => setReportOpen(true)} />

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          onSubmit={(report) => console.log('Report submitted', report)}
        />
      )}
    </div>
  );
}
