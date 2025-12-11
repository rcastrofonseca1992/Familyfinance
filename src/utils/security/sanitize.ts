/**
 * Lightweight sanitizer to prevent accidental rendering of unsafe HTML strings.
 * Consumers should apply this before passing user-provided content to the UI layer.
 */
export function sanitizeInput(value: string): string {
  const withoutScripts = value.replace(/<\/?script[^>]*>/gi, '');
  const withoutEventHandlers = withoutScripts.replace(/on[a-zA-Z]+\s*=\s*"[^"]*"/g, '');
  return withoutEventHandlers;
}
