import { useCallback, useState } from 'react';

/** Manages the in-memory admin secret needed for privileged admin actions (currently just
 *  promote/demote — see `adminPromoteUser`'s `x-admin-secret` header). Rather than a
 *  standing input field, callers wrap an action in `withSecret`; if no secret is cached
 *  yet, `modalOpen` flips true so the caller can render a prompt. The prompt's "remember
 *  for this session" choice controls whether the secret is cached for later actions or
 *  discarded right after use. */
export function useAdminSecret() {
  const [secret, setSecret] = useState<string | null>(null);
  const [pending, setPending] = useState<((secret: string) => void) | null>(null);

  const withSecret = useCallback((action: (secret: string) => void) => {
    if (secret) {
      action(secret);
      return;
    }
    setPending(() => action);
  }, [secret]);

  const submit = useCallback((value: string, remember: boolean) => {
    if (remember) setSecret(value);
    setPending((prev: ((secret: string) => void) | null) => {
      prev?.(value);
      return null;
    });
  }, []);

  const cancel = useCallback(() => setPending(null), []);

  return { modalOpen: pending !== null, hasSecret: secret !== null, withSecret, submit, cancel };
}
