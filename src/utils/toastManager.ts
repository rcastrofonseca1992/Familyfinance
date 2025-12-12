import { toast as sonnerToast, type ExternalToast } from "sonner@2.0.3";

// Prevent duplicate toasts for the same message
const shownMessages = new Set<string>();

// Prevent toast floods (3 login toasts etc.)
let lastToastTime = 0;
const MIN_INTERVAL = 700; // ms (ideal UX interval)

// Default toast settings
const baseOptions: ExternalToast = {
  duration: 3500,
};

// Merge provided options with defaults
const mergeOptions = (options?: ExternalToast): ExternalToast => ({
  ...baseOptions,
  ...options,
});

// Before showing a toast, verify if allowed
const shouldShow = (message: string): boolean => {
  const now = Date.now();

  // Suppress spam from multiple events triggering at once
  if (now - lastToastTime < MIN_INTERVAL) return false;
  lastToastTime = now;

  // Suppress duplicates (same message repeatedly)
  if (shownMessages.has(message)) return false;

  shownMessages.add(message);

  // Allow the same message again after a few seconds
  setTimeout(() => shownMessages.delete(message), 6000);

  return true;
};

// Silent offline failures (best UX)
const isOffline = () => !navigator.onLine;

// ------- Toast API -------

const success = (message: string, options?: ExternalToast) => {
  if (!shouldShow(message)) return;
  if (isOffline()) return; // silent when offline
  return sonnerToast.success(message, mergeOptions(options));
};

const error = (message: string, options?: ExternalToast) => {
  if (!shouldShow(message)) return;

  // Do not show server errors when offline — they cause panic
  if (isOffline()) return;

  return sonnerToast.error(message, mergeOptions(options));
};

const info = (message: string, options?: ExternalToast) => {
  if (!shouldShow(message)) return;
  return sonnerToast.info(message, mergeOptions(options));
};

const warning = (message: string, options?: ExternalToast) => {
  if (!shouldShow(message)) return;
  return sonnerToast.warning(message, mergeOptions(options));
};

const custom = (message: string, options?: ExternalToast) => {
  if (!shouldShow(message)) return;
  return sonnerToast(message, mergeOptions(options));
};

// Toast.Promise wrapper (no dedupe—promise flow must show)
const promise = <T>(promiseLike: Promise<T>, messages: any, options?: ExternalToast) =>
  sonnerToast.promise(promiseLike, messages, mergeOptions(options));

// Manual dismiss
const dismiss = (toastId?: string | number) => sonnerToast.dismiss(toastId);

export const toastManager = {
  success,
  error,
  info,
  warning,
  custom,
  promise,
  dismiss,
};

export {
  success,
  error,
  info,
  warning,
  custom,
  promise,
  dismiss,
  sonnerToast as rawToast,
};

export const toast = toastManager;
