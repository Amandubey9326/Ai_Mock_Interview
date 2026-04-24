import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} — HireMind AI`;
    return () => { document.title = prev; };
  }, [title]);
}
