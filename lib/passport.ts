/**
 * Passport.js is a popular authentication middleware for Node.js that provides a flexible way to integrate various
 * authentication mechanisms, including OpenID Connect (OIDC). In the context of OpenID Connect, Passport.js acts as
 * an Identity and Access Management (IAM) solution by leveraging authentication providers that follow the OIDC standard.
 * The given code configures Passport.js to use an **OpenID Connect strategy**, which enables user authentication via
 * an OIDC-compliant Identity Provider (IdP). The `OpenIDConnectStrategy` is initialized with key endpoints (issuer,
 * authorization URL, token URL, and user info URL), as well as OAuth 2.0 credentials (`clientID` and `clientSecret`).
 * Once a user is authenticated, Passport retrieves the user's profile from the IdP and invokes the `done` callback
 * to pass the user object for further processing. Additionally, `passport.serializeUser` and `passport.deserializeUser`
 * enable session management by converting the user object into a storable format and reconstructing it when needed.
 *
 * The concept of **strategy** in OIDC IAM refers to the abstraction that Passport.js uses to handle different
 * authentication methods. Each strategy encapsulates a particular authentication flow, allowing developers to plug in
 * different authentication providers with minimal changes to their application logic. In the context of OIDC, the
 * strategy defines how the authentication request is made, how tokens are exchanged, and how user information is
 * retrieved. The **OpenIDConnectStrategy** in this code follows the OIDC authorization code flow, where a user is
 * redirected to the IdP, grants authorization, and receives an ID token along with access tokens. This strategy-based
 * approach in Passport.js allows applications to be modular and extensible, supporting multiple authentication
 * mechanisms such as OAuth, SAML, or LDAP, depending on the requirements of the IAM system.
 */

import passport from 'passport';
import { Strategy as OpenIDConnectStrategy, VerifyCallback, Profile } from 'passport-openidconnect';

// Configure OpenID Connect strategy
passport.use(
  new OpenIDConnectStrategy(
    {
      issuer: process.env.APP_ID_ISSUER!,
      clientID: process.env.APP_ID_CLIENT_ID!,
      clientSecret: process.env.APP_ID_CLIENT_SECRET!,
      authorizationURL: `${process.env.APP_ID_ISSUER}/authorization`,
      tokenURL: `${process.env.APP_ID_ISSUER}/token`,
      userInfoURL: `${process.env.APP_ID_ISSUER}/userinfo`,
      callbackURL: '/api/auth/callback',
    },
    (
      issuer: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      return done(null, profile as any);
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((obj: any, done) => {
  done(null, obj);
});

export default passport; 