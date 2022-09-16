import type {
  CloudFrontRequest,
  CloudFrontRequestHandler,
  CloudFrontRequestResult,
} from 'aws-lambda';

import {
  ServiceProvider as serviceProvider,
  IdentityProvider as identityProvider,
  setSchemaValidator,
} from 'samlify';
import { parse as parseQueryString } from 'node:querystring';
import { spMetadata, idpMetadata } from '@@shared/config';
import { encrypt, isValidAudience } from '@@shared/utils/crypt';
import { getDomain } from '@@shared/utils/cloudfront';

const idp = identityProvider({
  metadata: idpMetadata,
});

export const handler: CloudFrontRequestHandler = (event, context, callback) => {
  const method = event.Records[0].cf.request.method || '';

  if (method.toLowerCase() !== 'post') {
    callback(null, invalidRequest);
    return;
  }
  const payload = getBody(event.Records[0].cf.request.body);
  if (!payload) {
    callback(null, invalidRequest);
    return;
  }
  const domain = getDomain(event.Records[0].cf.request.headers);
  if (!domain) {
    callback(null, invalidRequest);
    return;
  }

  try {
    const sp = serviceProvider({
      metadata: spMetadata(domain),
    });

    setSchemaValidator({
      validate: (response: string) => {
        return Promise.resolve('skipped');
      },
    });

    const payloadAsObject = parseQueryString(payload);

    sp.parseLoginResponse(idp, 'post', { body: payloadAsObject })
      .then((parseResult) => {
        const expiry = new Date(parseResult.extract.conditions.notOnOrAfter).getTime();
        const now = new Date().getTime();
        if (isValidAudience(parseResult.extract.audience) && expiry > now) {
          const relayState = payloadAsObject.RelayState || '/';
          const encryptedToken = encrypt({
            audience: parseResult.extract.audience,
            validUntil: expiry,
            domain,
          });
          const response = {
            status: '302',
            headers: {
              'set-cookie': [
                {
                  key: 'Set-Cookie',
                  value: `accessToken=${encryptedToken};expires=${new Date(parseResult.extract.conditions.notOnOrAfter).toUTCString()};path=/`,
                },
              ],
              location: [
                {
                  key: 'location',
                  value: `https://${domain}${relayState}`,
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
        } else {
          callback(null, invalidRequest);
        }
      })
      .catch((e) => {
        callback(null, invalidRequest);
      });
  } catch {
    callback(null, invalidRequest);
  }
};

/**
 * Return request body as string
 */
function getBody(body: CloudFrontRequest['body']): string | undefined {
  if (!body) {
    return undefined;
  }
  if (body.encoding === 'base64') {
    return Buffer.from(body.data, 'base64').toString('utf-8');
  }
  return body.data;
}

const invalidRequest: CloudFrontRequestResult = {
  status: '400',
  statusDescription: 'Invalid SAML Payload',
  body: 'Invalid SAML Payload',
  bodyEncoding: 'text',
};
