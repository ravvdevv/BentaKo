import { useMemo } from 'react';
import { prepare, layout } from 'pretext';

/**
 * Hook to measure text dimensions using the 'pretext' library.
 * Useful for ensuring layout stability and preventing reflows.
 */
export const usePretext = (text: string, font: string = '16px Inter', width: number = 400) => {
  // 1. Prepare: Perform text segmentation and Canvas measurements (cached)
  const handle = useMemo(() => {
    try {
      return prepare(text, font);
    } catch (e) {
      console.warn('Pretext prepare failed:', e);
      return null;
    }
  }, [text, font]);

  // 2. Layout: Calculate lines and height based on specific width (arithmetic)
  const result = useMemo(() => {
    if (!handle) return { height: 0, lines: [] };
    try {
      return layout(handle, width);
    } catch (e) {
      console.warn('Pretext layout failed:', e);
      return { height: 0, lines: [] };
    }
  }, [handle, width]);

  return { height: result.height, lines: result.lines };
};
