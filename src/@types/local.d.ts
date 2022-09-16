declare module 'local-ts' {
  namespace Log {
    type LogHandlers = 'generic';

    type Processes = 'process_generic';

    type Others = 'generic';

    type HttpAPIs = 'http_generic';

    type AwsAPIs = 'aws_generic';
  }
  interface AccessDetails {
    audience: string;
    validUntil: number;
    domain: string;
  }
}
