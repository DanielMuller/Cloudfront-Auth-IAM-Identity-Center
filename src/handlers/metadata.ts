import type { CloudFrontRequestHandler, CloudFrontRequestResult } from 'aws-lambda';

import { ServiceProvider as serviceProvider } from 'samlify';
import { spMetadata } from '@@shared/config';
import { getDomain } from '@@shared/utils/cloudfront';

export const handler: CloudFrontRequestHandler = (event, context, callback) => {
  try {
    const domain = getDomain(event.Records[0].cf.request.headers);
    if (!domain) {
      callback(null, invalidRequest);
      return;
    }

    if (!domain) {
      callback(null, invalidRequest);
      return;
    }

    const sp = serviceProvider({
      metadata: spMetadata(domain),
    });
    const response = {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
        ],
        'cache-control': [
          {
            key: 'Cache-Control',
            value: 'max-age=31536000',
          },
        ],
      },
      body: sp.getMetadata(),
    };
    callback(null, response);
    return;
  } catch {
    callback(null, invalidRequest);
  }
};

const invalidRequest: CloudFrontRequestResult = {
  status: '400',
  statusDescription: 'Invalid Request',
  body: 'Invalid Request',
  bodyEncoding: 'text',
};
