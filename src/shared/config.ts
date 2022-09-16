import {secrets} from '../secrets/main'
export const config = {
  acsPath: '/saml/acs',
};

/**
 * Build The Service Providers metadata.xml
 */
export function spMetadata(domain: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <md:EntityDescriptor
    xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
    xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
    xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
    entityID="${secrets.audience}">
       <md:SPSSODescriptor WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
           <md:NameIDFormat>urn:oasis:names:tc:SAML:2.0:nameid-format:transient</md:NameIDFormat>
           <md:AssertionConsumerService isDefault="true" index="0" Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://${domain}${config.acsPath}"/>
       </md:SPSSODescriptor>
  </md:EntityDescriptor>`;
}

export const idpMetadata = secrets.idpMetadata;
