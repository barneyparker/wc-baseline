# WC Baseline

The is an experimental repository to build a web-component based, Multi-Page Architecture (MPA) site with Social Auth

The back end will be static code in S3, API endpoint in API Gateway HTTP APIs, fronted by CloudFront.

The aim is provide a re-usable starting point for a number of projects, in a standardised, opinionated way.

## Notable Points

- Lambda funtions on the back end will be intially deployed with dummy code. They will fail until valid code bundles are uploaded.
- Private routes will be protected with a JWT autorizer. We will provide our own JWTs however we will use social auth. Multiple social options can be assigned to a user hence requiring our own OAuth endpoints.
- All front-end code will be static by default and served from S3
- The aim is to use Web Components wherever possible and avoid going down the SPA route
- We will dynamically add the .html extension for any url where there is no extension provided using a cloudfront function
- routes ending in a `/` will be assumed to index.html
- All other document types will include the extension
- functions will be uploaded according to their folder name. For example a function located at `/functions/dashboard` will be bundled and uploaded to a lambda function called `dashboard`
- Everything will be deployed using GitHub Actions
- AWS access will be provided via OIDC
- each top-level folder will be deployed in parallel in separate actions workflows

## Structure

Our folder structure will be as follows:

```
.
├── .github/
│   └── workflows/
│       └── <workflows>
├── functions/
│   └── <backend function code>
├── infrastructure/
│   ├── <infra code>
│   ├── variables.tf
│   └── modules/
│       └── <helper modules>
└── web/
    └── <web assets>
```

## Security

- **WAF**: The CloudFront distribution does not yet have an associated Web
  Application Firewall (WAF). Before production launch, attach a WAF web ACL
  with rate limiting and OWASP top-10 rule groups to the distribution.
