/**
 * This file implements the user information page of the application, providing a detailed view of user data
 * and profile information. It utilizes Next.js features and next-auth for authentication, implementing both
 * client-side and server-side data fetching to display comprehensive user details while maintaining security
 * through proper authentication checks.
 * 
 * The implementation includes error handling for failed data fetches, loading states management, and proper
 * type definitions for props. It provides a responsive interface using Bootstrap styling while ensuring
 * secure access to user information through session verification and proper error boundary implementation.
 * The page displays user-specific data fetched from the backend API and handles various edge cases including
 * network errors and invalid user states.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import axios from "axios";
import Layout from "../components/Layout";

interface UserInfoProps {
  userInfo: any;
  error?: string;
}

export default function UserInfo({ userInfo, error }: UserInfoProps) {
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

  if (error) {
    return (
      <Layout title="Error - User Info">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header bg-danger text-white">
                  <h1 className="h4 mb-0">❌ Error Fetching User Info</h1>
                </div>
                <div className="card-body">
                  <div className="alert alert-danger mb-4">
                    <p className="mb-0">{error}</p>
                  </div>
                  <div className="d-grid">
                    <button 
                      onClick={() => router.push("/")}
                      className="btn btn-primary"
                    >
                      Return to Home
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

  return (
    <Layout title="User Info - YorkU Secure App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">👤 User Information</h1>
                <button 
                  onClick={() => router.push("/")}
                  className="btn btn-light btn-sm"
                >
                  Return to Home
                </button>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h2 className="h5 mb-0">Session User</h2>
                      </div>
                      <div className="card-body">
                        <div className="bg-light p-3 rounded">
                          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {JSON.stringify(session?.user, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header">
                        <h2 className="h5 mb-0">OIDC UserInfo</h2>
                      </div>
                      <div className="card-body">
                        <div className="bg-light p-3 rounded">
                          <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                            {JSON.stringify(userInfo, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<UserInfoProps> = async (context) => {
  try {
    const userInfoEndpoint = `${process.env.APP_ID_ISSUER}/userinfo`;
    const session = await import("next-auth/react").then((mod) => 
      mod.getSession(context)
    );

    if (!session?.accessToken) {
      return {
        redirect: {
          destination: "/api/auth/signin",
          permanent: false,
        },
      };
    }

    const response = await axios.get(userInfoEndpoint, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return {
      props: {
        userInfo: response.data,
      },
    };
  } catch (error) {
    console.error("Error fetching userinfo:", error);
    return {
      props: {
        userInfo: null,
        error: "Failed to fetch user information",
      },
    };
  }
}; 