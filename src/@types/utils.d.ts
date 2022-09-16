declare module 'utils-ts' {
  import type { Log } from 'logger-ts';

  namespace Utils {
    interface Context {
      logger: Log.Logger;
    }

    interface ValidationResult {
      isValid: boolean;
      invalidReason?: string;
    }

    /**
     * Function return type with undefined
     */
    type FnR<T> = T | undefined;
  }
}
