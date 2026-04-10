declare module 'pretext' {
  export type PretextHandle = unknown;

  export interface PretextLayoutResult {
    height: number;
    lines: Array<{
      width: number;
      text: string;
    }>;
  }

  /**
   * Measures text segments and returns a handle for layout calculations.
   */
  export function prepare(text: string, font: string): PretextHandle;

  /**
   * Calculates the text layout (height and line breaks) for a given width.
   */
  export function layout(handle: PretextHandle, width: number): PretextLayoutResult;
}
