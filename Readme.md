# Cloudfront Authentication with IAM Identity Center

This project allows you to set up a Cloudfront Distribution with an S3-Website origin protected with identities from IAM Identity Center.

Login can be both SP initiated and IdP initiated.

## Setup
### IAM Identity Center
* Start creating  a new Custom SAML Application in IAM Identity Center
* Download the IdP metadata.xml
* Don't finish the applications setup yet

### Code
```
git clone http://github.com/DanielMuller/Cloudfront-Auth-IAM-Identity-Center
cd Cloudfront-Auth-IAM-Identity-Center
npm i
```

Edit `serverless.yml`, change the following settings:
* service
* custom.domainName: This is the domain for your Cloudfront distribution
* custom.hostedZoneId: The Route53 HostedZoneId for your domain
* custom.bucketRegion: The region you want your S3 Bucket to be created in
* custom.sourceToken: Any string, protects direct access to your bucket 
* custom.origin.DomainName: Remove `.${self:custom.bucketRegion}` if your bucket is in us-east-1
* provider.deploymentBucket.name: Set your deployment bucket name

Create `src/secrets/main.ts`:
```typescript
export const secrets = {
  initVector: '1234567890123456', // 16 Bytes
  privateKey: '12345678901234567890123456789012', // 32 Bytes
  audience: 'audience string', // To be filled into AWS IAM Identity Provider Application,
  idpMetadata: `XML content of IdP metadata.xml`
};
```

```
sls deploy
```

### Finish setting up IAM Identity center
* Get your SP metadata.xml by visiting https://Your.example.com/saml/metadata.xml, download the file
* In IAM Identity center, in your "Custom SAML Application", upload the `metadata.xml` file in the "Application Metadata" area.
* Create your application
* Edit the Application's Attribute Mappings:
  * Map _Subject_ to any name, set the format to _transient_
* Attach a user or a group to the application
