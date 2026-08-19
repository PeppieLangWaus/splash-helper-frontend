import { useEffect, useState, useCallback } from 'react';
import { getActiveSessions } from '../api';
import type { ActiveSession } from '../types';
import './AllSplashersView.css';
import Chatbox from '../components/chatbox/Chatbox';
import SessionPanel from '../components/SessionPanel';

interface Props {
  onSelectUser?: (username: string) => void;
}

export default function AllSplashersView({ onSelectUser }: Props) {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await getActiveSessions();
      setSessions(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    // Poll every 15 seconds
    const id = setInterval(() => { void load(); }, 15000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div className="all-splashers-view">
      <div className="all-splashers-header">
        <div>
          <h2 className="all-splashers-heading">Active Splashers</h2>
          {lastRefresh && (
            <div className="all-splashers-meta">Updated {lastRefresh.toLocaleTimeString()} · auto-refreshes every 15s</div>
          )}
        </div>
        <button className="all-splashers-refresh-btn" onClick={() => { void load(); }} type="button">
          ↻ Refresh
        </button>
      </div>

      {error && <div className="all-splashers-error-box">{error}</div>}

      {loading && <p className="all-splashers-empty-msg">Loading…</p>}

      {!loading && !error && sessions.length === 0 && (
        <p className="all-splashers-empty-msg">No splashers are currently active.</p>
      )}

      {!error && sessions.length > 0 && (
        <div className="all-splashers-grid">
          {sessions.map((session) => (
            <SessionPanel key={session.username} session={session} onSelectUser={onSelectUser} />
          ))}
        </div>
      )}

      <Chatbox className="all-splashers-chatbox" />
    </div>
  );
}
