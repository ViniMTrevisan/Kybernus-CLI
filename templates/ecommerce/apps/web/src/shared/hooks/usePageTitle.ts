import { useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';

/**
 * Sets document.title to "<title> | <siteConfig.name>" while the component is
 * mounted, then restores the base site name on unmount.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
