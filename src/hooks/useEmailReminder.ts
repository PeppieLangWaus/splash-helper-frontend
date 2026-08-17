import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types/chatbox';
import { useAuth } from '../context/AuthContext';
import { getArchivedSessions } from '../api';
import { logSystemEvent } from '../utils/systemLog';

/** Checks once per mount whether the logged-in user has a verified email on file, and if not,
 *  posts a one-shot reminder into the Private tab (see logSystemEvent) — either "add an email"
 *  or "verify the one you added", depending on state. Returns the message that fired (once, the
 *  first time it fires this mount) so Chatbox can react to it — switch to Private, spotlight it,
 *  flash the window (see Chatbox.tsx). A no-op while logged out, already verified, or if the
 *  check itself fails (a failed fetch just skips the reminder for this visit). */
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
        // Transient fetch failure — just skip the reminder for this visit.
      });

    return () => {
      cancelled = true;
    };
  }, [user, token]);

  return reminder;
}
