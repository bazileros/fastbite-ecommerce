const config = {
  providers: [
    {
      type: "jwt",
      domain: process.env.LOGTO_ENDPOINT,
      issuer: "https://auth.usa-solarenergy.com/oidc",
      audience: process.env.LOGTO_APP_ID,
      applicationID: process.env.LOGTO_APP_ID,
      jwksEndpoint: "https://auth.usa-solarenergy.com/oidc/jwks",
    },
  ],
};

export default config;