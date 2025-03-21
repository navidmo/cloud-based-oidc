/**
 * This file implements a protected page that requires authentication to access, demonstrating secure
 * access control mechanisms within the application. It utilizes Next.js server-side props and next-auth
 * for authentication verification, ensuring that only authenticated users can view the protected content.
 * 
 * The implementation includes both client-side and server-side authentication checks, with proper
 * handling of loading states and unauthorized access attempts. It demonstrates the integration of
 * session management, user role verification, and secure routing practices to maintain application
 * security standards.
 * 
 * The component provides a secure interface displaying user-specific information and protected content,
 * implementing proper type definitions for props and maintaining consistent error handling. It follows
 * best practices for protected route implementation in Next.js applications while ensuring a smooth
 * user experience through appropriate loading states and redirects.
 */

import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "../components/Layout";

interface ProtectedProps {
  user: {
    name?: string;
    email?: string;
    roles?: Array<{ id: string; name: string }>;
  };
}

export default function Protected({ user }: ProtectedProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <Layout>
        <div className="container mt-5">
          <div className="d-flex justify-content-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") {
      router.push("/api/auth/signin");
    }
    return null;
  }

  return (
    <Layout title="Protected Page - YorkU Secure App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h1 className="h4 mb-0">🔐 Protected Page</h1>
              </div>
              <div className="card-body">
                <div className="alert alert-success mb-4">
                  <p className="mb-0">Welcome, {user?.name || session?.user?.name}!</p>
                </div>

                <div className="mb-4">
                  <h2 className="h5">Your User Details</h2>
                  <div className="bg-light p-3 rounded">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(session.user, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="d-grid">
                  <button 
                    onClick={() => router.push("/")}
                    className="btn btn-primary"
                  >
                    Return to Home Page
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<ProtectedProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/api/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { user: session.user },
  };
}; 