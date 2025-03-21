/**
 * This middleware implements authentication and authorization for Next.js server-side props. It wraps around
 * the getServerSideProps function to ensure that users are authenticated before accessing protected pages.
 * The middleware checks for an active session using next-auth, and if no session exists, redirects the user
 * to the sign-in page.
 * 
 * Additionally, this middleware supports role-based access control (RBAC) through the optional requiredRoles
 * parameter. When roles are specified, it verifies that the authenticated user has at least one of the
 * required roles before granting access. If the user lacks the necessary role permissions, they are
 * redirected to an unauthorized page. This provides a flexible way to protect routes based on both
 * authentication status and user roles.
 */

import { getSession } from "next-auth/react";
import { GetServerSideProps, GetServerSidePropsContext } from "next";

export function withAuth(
  gssp: GetServerSideProps,
  requiredRoles?: string[]
): GetServerSideProps {
  return async (context: GetServerSidePropsContext) => {
    const session = await getSession(context);

    if (!session) {
      return {
        redirect: {
          destination: "/api/auth/signin",
          permanent: false,
        },
      };
    }

    // Check for required roles
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = session.user?.roles?.map(role => role.name) || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return {
          redirect: {
            destination: "/unauthorized",
            permanent: false,
          },
        };
      }
    }

    return await gssp(context); // Continue on to call `getServerSideProps` logic
  };
} 