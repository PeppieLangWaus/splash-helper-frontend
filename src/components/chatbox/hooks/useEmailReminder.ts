import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../../../types/chatbox';
import { useAuth } from '../../../context/AuthContext';
import { getArchivedSessions } from '../../../api';
import { logSystemEvent } from '../../../utils/systemLog';

export function useEmailReminder(): ChatMessage | null {
  const { user, token } = useAuth();
  const [reminder, setReminder] = useState<ChatMessage | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!user || !token || firedRef.current) return;
    let cancelled = false;

    getArchivedSessions(user.username, token)
      .then((data) => {
        if (cancelled || firedRef.current || data.emailVerifiedAt) return;
        firedRef.current = true;
        const text = data.email
          ? "Your email isn't verified yet — check your inbox to finish setup."
          : 'Add an email to your account for recovery access.';
        setReminder(logSystemEvent(text));
      })
      .catch(() => {

      });

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  return reminder;
}
