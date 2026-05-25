import { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';

export function useWebContainer() {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function boot() {
      try {
        const instance = await WebContainer.boot();
        unsubscribe = instance.on('server-ready', (_port, url) => {
          setPreviewUrl(url);
          setPreviewError(null);
        });
        setWebcontainer(instance);
      } catch (error) {
        console.error('WebContainer boot failed:', error);
        setPreviewError('Failed to initialize preview environment');
      }
    }

    boot();

    return () => {
      unsubscribe?.();
    };
  }, []);

  return { webcontainer, previewUrl, previewError };
}
