/**
 * This file extends the default type definitions for next-auth by declaring additional custom types
 * and interfaces specific to our application's authentication needs. It augments the built-in Session
 * and Profile interfaces to include additional properties such as user roles, identity provider information,
 * and custom user attributes that are essential for implementing role-based access control and managing
 * user identities across multiple authentication providers.
 * 
 * The type definitions here ensure type safety throughout the application when working with user sessions
 * and profiles. It includes detailed typing for user roles, email verification status, and identity
 * provider-specific information, enabling proper TypeScript type checking when accessing these properties
 * in components and API routes. This helps catch potential type-related errors during development and
 * provides better IDE support through accurate type inference.
 */

import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string;
      email?: string;
      image?: string;
      roles?: Array<{ id: string; name: string }>;
      email_verified?: boolean;
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
    };
    accessToken?: string;
  }

  interface Profile {
    sub: string;
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
}

declare module 'next-auth/jwt' {
  interface JWT {
    user?: {
      id?: string;
      name?: string;
      email?: string;
      roles?: Array<{ id: string; name: string }>;
      email_verified?: boolean;
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
    };
    accessToken?: string;
  }
}