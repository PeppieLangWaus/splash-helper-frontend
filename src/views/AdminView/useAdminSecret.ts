import { useCallback, useState } from 'react';

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
