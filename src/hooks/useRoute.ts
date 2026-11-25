import { useCallback, useEffect, useState } from 'react';

export type AppRoute =
  | { readonly kind: 'home' }
  | { readonly kind: 'news-list' }
  | { readonly kind: 'news-detail'; readonly slug: string };

function parsePathname(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/berita') {
    return { kind: 'news-list' };
  }
  if (clean.startsWith('/berita/')) {
    const slug = decodeURIComponent(clean.slice('/berita/'.length));
    if (slug) {
      return { kind: 'news-detail', slug };
    }
  }
  return { kind: 'home' };
}

export function useRoute() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parsePathname(window.location.pathname),
  );

  useEffect(() => {
    const onPopState = () => {
      setRoute(parsePathname(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const [pathPart, hashPart] = to.split('#');
    const targetPath = pathPart || '/';
    const targetUrl = hashPart ? `${targetPath}#${hashPart}` : targetPath;

    if (window.location.pathname !== targetPath || window.location.hash !== (hashPart ? `#${hashPart}` : '')) {
      window.history.pushState({}, '', targetUrl);
    }

    setRoute(parsePathname(targetPath));

    if (hashPart) {
      window.requestAnimationFrame(() => {
        const el = document.getElementById(hashPart);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  return { route, navigate };
}
