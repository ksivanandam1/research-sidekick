import { useEffect, useState } from 'react';

/**
 * Reveals `text` progressively while `active` is true, mimicking a lightweight
 * "drafting" effect. When `active` is false the full text is shown immediately.
 */
export function useTypewriter(text: string, active: boolean, chunk = 3, speedMs = 14): string {
  const [shown, setShown] = useState(active ? '' : text);

  useEffect(() => {
    if (!active) {
      setShown(text);
      return;
    }
    setShown('');
    let i = 0;
    const id = setInterval(() => {
      i += chunk;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speedMs);
    return () => clearInterval(id);
  }, [text, active, chunk, speedMs]);

  return shown;
}
