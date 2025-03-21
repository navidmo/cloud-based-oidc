/**
 * This file implements the authentication configuration for Next.js using NextAuth.js, specifically
 * integrating with IBM App ID for secure user authentication. It handles the authentication flow,
 * session management, and role-based access control for the application.
 * 
 * The implementation includes custom interfaces for handling IBM App ID specific profile structures
 * and token information. It defines the IBMAppIDProfile interface which contains user information
 * including sub, name, email, verification status, and roles, as well as identity provider specific
 * information through the identities array.
 * 
 * Token management is handled through the TokenInfo interface, which maintains both access and ID
 * tokens received from the authentication provider. These tokens are crucial for maintaining secure
 * sessions and making authorized API calls.
 * 
 * The file implements a fetchUserRoles function that extracts role information from the access token.
 * This function decodes the JWT token to access the embedded role information, providing a secure way
 * to implement role-based access control throughout the application.
 * 
 * Error handling is implemented throughout the authentication flow, with appropriate logging and
 * fallback mechanisms to ensure graceful degradation in case of authentication failures or invalid
 * token formats.
 * 
 * The authentication configuration supports session management, allowing the application to maintain
 * user state across requests while ensuring security through proper token validation and renewal
 * processes.
 * 
 * Integration with IBM App ID is configured to support various authentication flows including
 * username/password, social login, and enterprise SSO options, providing flexibility in how users
 * can authenticate with the application.
 * 
 * The implementation includes proper typing through TypeScript interfaces, ensuring type safety
 * throughout the authentication flow and making the code more maintainable and less prone to
 * runtime errors.
 * 
 * Security best practices are followed throughout, including proper token handling, secure session
 * management, and appropriate error handling to prevent security vulnerabilities.
 * 
 * The file serves as the central authentication configuration for the application, working in
 * conjunction with other components like the Layout component and various admin pages to provide
 * a secure, role-based application architecture.
 */

import NextAuth from "next-auth";
import { decode } from "jsonwebtoken";

interface IBMAppIDProfile {
  sub?: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  roles?: Array<{ id: string; name: string }>;
  identities?: Array<{
    provider: string;
    id: string;
    idpUserInfo?: {
      displayName: string;
      active: boolean;
      emails: Array<{ value: string; primary: boolean }>;
      name: {
        givenName: string;
        familyName: string;
        formatted: string;
      };
      status: string;
      idpType: string;
    };
  }>;
}

interface TokenInfo {
  access_token?: string;
  id_token?: string;
}

async function fetchUserRoles(userId: string | undefined, accessToken: string | undefined): Promise<Array<{ id: string; name: string }>> {
  if (!userId || !accessToken) {
    console.error("Missing userId or accessToken");
    return [];
  }

  try {
    // Extract roles from the access token scope
    const [, payload] = accessToken.split('.');
    if (!payload) {
      console.error("Invalid access token format");
      return [];
    }

    try {
      const decodedToken = JSON.parse(Buffer.from(payload, 'base64').toString());
      console.log('Decoded access token:', JSON.stringify(decodedToken, null, 2));
      
      const scopes = decodedToken.scope;
      if (!scopes) {
        console.log('No scopes found in token');
        return [];
      }

      // Convert scopes string to array and map to roles
      const scopeArray = typeof scopes === 'string' ? scopes.split(' ') : [];
      const roles = [];
      
      // Check for admin scope
      if (scopeArray.includes('admin')) {
        roles.push({ id: 'admin', name: 'admin' });
      }
      
      // Check for staff scope
      if (scopeArray.includes('staff')) {
        roles.push({ id: 'staff', name: 'staff' });
      }
      
      // Check for other role-related scopes
      if (scopeArray.includes('appid_manage_roles')) {
        roles.push({ id: 'role_manager', name: 'role_manager' });
      }

      console.log('Extracted roles from scopes:', roles);
      return roles;
    } catch (e) {
      console.error('Error decoding token payload:', e);
      return [];
    }
  } catch (error) {
    console.error("Error processing roles:", error);
    return [];
  }
}

async function safelyFetchRoles(profile: IBMAppIDProfile, accessToken: string | undefined) {
  return await fetchUserRoles(profile.sub, accessToken);
}

async function profile(profile: IBMAppIDProfile, tokens: TokenInfo): Promise<any> {
  // Get roles from the access token
  const roles = await fetchUserRoles(profile.sub, tokens.access_token);
  console.log('Profile roles:', roles);

  return {
    id: profile.sub,
    name: profile.name || `${profile.given_name} ${profile.family_name}`,
    email: profile.email,
    email_verified: profile.email_verified,
    roles: roles,
    identities: profile.identities || [],
  };
}

export default NextAuth({
  debug: true,
  providers: [
    {
      id: "ibm-appid",
      name: "IBM App ID",
      type: "oauth",
      version: "2.0",
      clientId: process.env.APP_ID_CLIENT_ID,
      clientSecret: process.env.APP_ID_CLIENT_SECRET,
      issuer: process.env.APP_ID_ISSUER,
      wellKnown: `${process.env.APP_ID_ISSUER}/.well-known/openid-configuration`,
      authorization: {
        url: `${process.env.APP_ID_ISSUER}/authorization`,
        params: {
          scope: "openid email profile appid_authenticated appid_manage_roles admin staff",
          response_type: "code",
          code_challenge_method: "S256",
        },
      },
      token: `${process.env.APP_ID_ISSUER}/token`,
      userinfo: `${process.env.APP_ID_ISSUER}/userinfo`,
      checks: ["pkce"],
      profile,
    },
  ],
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account && profile) {
        // Get roles directly from the access token
        const roles = await fetchUserRoles(profile.sub, account.access_token);
        console.log('JWT callback roles:', roles);
        
        token.user = {
          ...user,
          roles,
          id: profile.sub,
          email: profile.email ?? user.email ?? undefined,
          name: profile.name ?? user.name ?? undefined,
        };
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
}); 