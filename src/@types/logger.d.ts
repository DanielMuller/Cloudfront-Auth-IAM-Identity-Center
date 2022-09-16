declare module 'logger-ts' {
  import type { Utils } from 'utils-ts';
  import type { Log as localLog } from 'local-ts';

  namespace Log {
    type LogHandlers = localLog.LogHandlers;

    type Processes = localLog.Processes;

    type Others = localLog.Others;

    type HttpAPIs = localLog.HttpAPIs;

    type AwsAPIs = localLog.AwsAPIs;

    interface MetricTags {
      Type: 'aws' | 'http' | 'process' | 'others';
    }

    type MetricActivity = HttpAPIs | LogHandlers | AwsAPIs | Processes | Others;

    type MetricType =
      | 'SuccessCount'
      | 'FailedCount'
      | 'SkipCount'
      | 'FallbackCount'
      | 'HitCount'
      | 'MissCount'
      | 'Duration'
      | 'Count';

    type LogLevels = 'debug' | 'http' | 'info' | 'warn' | 'error' | 'crit' | 'metric';

    interface LogMeta {
      /**
       * This is set by the loggify middlewarre for every invocation.
       */
      handler?: LogHandlers;
      /**
       * Log any type of data here
       */
      // @ts-expect-error: Unknown is valid here
      data?: Record<unknown, unknown>;
      /**
       * Name of the entity, object, activity, process, resource, action that the reported metric belongs to.
       */
      activity?: MetricActivity;
      /**
       * Correlation Id.
       */
      traceId?: string;
    }

    interface LogMetaMetric extends Pick<Log.LogMeta, 'traceId'> {
      /**
       * Parent group that a metric belongs to
       */
      tags: Array<[name: keyof MetricTags, value: MetricTags[keyof MetricTags]]>;
      /**
       * Type of metric
       */
      name: MetricType;
      /**
       * Name of the entity, object, activity, process, resource, action that the reported metric belongs to.
       */
      activity: MetricActivity;
      /**
       * A metric value associated with the metric name.
       */
      value: number;
    }

    interface LogGlobalMeta extends Partial<Pick<LogMeta, 'handler' | 'traceId'>> {}

    interface Logger {
      append: Log.LogGlobalMeta;
      debug: (message: string, meta?: Log.LogMeta) => void;
      http: (message: string, meta?: Log.LogMeta) => void;
      info: (message: string, meta?: Log.LogMeta) => void;
      warn: (
        message: string,
        e?: Error,
        meta?: Log.LogMeta & Required<Pick<LogMeta, 'activity'>>
      ) => void;
      error: (
        message: string,
        e?: Error,
        meta?: Log.LogMeta & Required<Pick<LogMeta, 'activity'>>
      ) => void;
      crit: (
        message: string,
        e?: Error,
        meta?: Log.LogMeta & Required<Pick<LogMeta, 'activity'>>
      ) => void;
      metric: (meta: Log.LogMetaMetric) => void;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type LoggifyHandler<T extends (...args: any[]) => any> = (params: Utils.Context) => T;
  }
}
