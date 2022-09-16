declare const GLOBAL_VAR_SERVICE_NAME: string;
declare const GLOBAL_VAR_NODE_ENV: 'local' | 'dev' | 'staging' | 'demo' | 'prod';
declare const GLOBAL_VAR_IS_LOCAL: boolean;
declare const GLOBAL_VAR_IS_TEST: boolean;
declare const GLOBAL_VAR_REGION: string;

declare namespace NodeJS {
  export interface ProcessEnv {
    region: string;
    DONT_LOG_SUCCESS_HTTP: string;
  }
}
