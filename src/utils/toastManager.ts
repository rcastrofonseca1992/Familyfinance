import { toast as sonnerToast, type ExternalToast } from 'sonner@2.0.3';

type ToastMessages = Parameters<typeof sonnerToast.promise>[1];
type ToastId = Parameters<typeof sonnerToast.dismiss>[0];

const baseOptions: ExternalToast = {
  duration: 3500,
};

const mergeOptions = (options?: ExternalToast) => ({
  ...baseOptions,
  ...options,
});

const success = (message: string, options?: ExternalToast) =>
  sonnerToast.success(message, mergeOptions(options));

const error = (message: string, options?: ExternalToast) =>
  sonnerToast.error(message, mergeOptions(options));

const info = (message: string, options?: ExternalToast) =>
  sonnerToast.info(message, mergeOptions(options));

const warning = (message: string, options?: ExternalToast) =>
  sonnerToast.warning(message, mergeOptions(options));

const custom = (message: string, options?: ExternalToast) =>
  sonnerToast(message, mergeOptions(options));

const promise = <T>(promiseLike: Promise<T>, messages: ToastMessages, options?: ExternalToast) =>
  sonnerToast.promise(promiseLike, messages, mergeOptions(options));

const dismiss = (toastId?: ToastId) => sonnerToast.dismiss(toastId);

export const toastManager = {
  success,
  error,
  info,
  warning,
  custom,
  promise,
  dismiss,
};

export { success, error, info, warning, custom, promise, dismiss };
export { sonnerToast as rawToast };
export const toast = toastManager;

