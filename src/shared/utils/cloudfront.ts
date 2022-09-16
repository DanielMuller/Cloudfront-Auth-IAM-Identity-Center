import type { CloudFrontHeaders } from 'aws-lambda';

/**
 * Extract the Host Request Header and return it's name
 */
export function getDomain(headers: CloudFrontHeaders): string | undefined {
  try {
    return 'host' in headers && Array.isArray(headers.host) ? headers.host[0].value : undefined;
  } catch {
    return undefined;
  }
}
