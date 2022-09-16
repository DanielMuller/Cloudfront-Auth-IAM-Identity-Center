import { createCipheriv, createDecipheriv } from 'node:crypto';
import { secrets } from '@@secrets/main';
import { AccessDetails } from 'local-ts';
const algorithm = 'aes-256-cbc';

/**
 * Decrypt a string
 */
function decrypt(message: string): AccessDetails {
  const cipher = createDecipheriv(
    algorithm,
    Buffer.from(secrets.privateKey),
    Buffer.from(secrets.initVector)
  );
  let decryptedData = cipher.update(message, 'hex', 'utf8');
  decryptedData += cipher.final('utf8');
  return JSON.parse(decryptedData);
}
/**
 * Encrypt a string
 */
export function encrypt(message: AccessDetails): string {
  const cipher = createCipheriv(
    algorithm,
    Buffer.from(secrets.privateKey),
    Buffer.from(secrets.initVector)
  );
  let encryptedData = cipher.update(JSON.stringify(message), 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}
/**
 * Validate Token
 */
export function isValidToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }
  try {
    const accessObject = decrypt(token);
    if (!accessObject.audience) {
      return false;
    }
    if (!accessObject.validUntil) {
      return false;
    }
    const now = new Date().getTime();

    return isValidAudience(accessObject.audience) && accessObject.validUntil > now;
  } catch {
    return false;
  }
}
/**
 * Validate Audience
 */
export function isValidAudience(audience: string | undefined): boolean {
  try {
    return audience === secrets.audience;
  } catch {
    return false;
  }
}
