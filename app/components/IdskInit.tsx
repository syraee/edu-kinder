'use client';
import { useEffect } from 'react';

export default function IdskInit() {
  useEffect(() => {
    (async () => {
      const mod: any = await import('@id-sk/frontend/dist/govuk/all.mjs');
      const initAll = mod?.initAll ?? mod?.default?.initAll ?? mod?.GOVUKFrontend?.initAll;
      if (typeof initAll === 'function') initAll();
      else console.warn('initAll nebolo nájdené', mod);
    })();
  }, []);
  return null;
}
