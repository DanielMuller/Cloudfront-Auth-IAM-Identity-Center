import type {
  CloudFrontHeaders,
  CloudFrontRequestHandler,
  CloudFrontRequestResult,
} from 'aws-lambda';

import { ServiceProvider as serviceProvider, IdentityProvider as identityProvider } from 'samlify';
import { spMetadata, idpMetadata } from '@@shared/config';
import { isValidToken } from '@@shared/utils/crypt';
import { getDomain } from '@@shared/utils/cloudfront';

const idp = identityProvider({
  metadata: idpMetadata,
});

export const handler: CloudFrontRequestHandler = (event, context, callback) => {
  try {
    const request = event.Records[0].cf.request;
    const headers = request.headers;
    const domain = getDomain(headers);
    if (!domain) {
      callback(null, invalidRequest);
      return;
    }
    const sp = serviceProvider({
      metadata: spMetadata(domain),
    });

    let accessGranted = false;

    if (headers.cookie) {
      const cookies = parseCookies(headers.cookie);
      if (isValidToken(cookies.accessToken)) {
        accessGranted = true;
      }
    }

    if (!accessGranted) {
      sp.entitySetting.relayState = request.uri;
      const { context: loginRequestUrl } = sp.createLoginRequest(idp, 'redirect');
      const response = {
        status: '307',
        headers: {
          location: [
            {
              key: 'Location',
              value: loginRequestUrl,
            },
          ],
          'cache-control': [
            {
              key: 'Cache-Control',
              value: 'max-age=0',
            },
          ],
        },
      };
      callback(null, response);
      return;
    }
    callback(null, request);
  } catch {
    callback(null, invalidRequest);
  }
};

const invalidRequest: CloudFrontRequestResult = {
  status: '403',
  statusDescription: 'Access Forbidden',
  body: 'Access Forbidden',
  bodyEncoding: 'text',
  headers: {
    'cache-control': [
      {
        key: 'Cache-Control',
        value: 'max-age=0',
      },
    ],
  },
};

/**
 * Convert Cookies to Object
 */
function parseCookies(cookies: CloudFrontHeaders['cookie']): Record<string, string> {
  const parsedCookies: Record<string, string> = {};
  for (const cookie of cookies) {
    cookie.value.split(';').forEach((el) => {
      if (el) {
        const parts = el.split('=');
        parsedCookies[parts[0].trim()] = parts[1].trim();
      }
    });
  }
  return parsedCookies;
}
