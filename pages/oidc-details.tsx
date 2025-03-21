/**
 * This file implements the OIDC (OpenID Connect) details page, providing a comprehensive view of the IBM App ID
 * OIDC configuration settings. It displays essential information about the authentication setup, including
 * endpoints, supported scopes, and other OIDC-specific parameters that are crucial for understanding the
 * authentication flow within the application.
 * 
 * The implementation utilizes Next.js features for server-side rendering of OIDC configuration data and
 * next-auth for authentication verification. It implements access control to ensure only authenticated users
 * can view these sensitive configuration details, with proper loading states and redirect handling for
 * unauthorized access attempts.
 */

import axios from "axios";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import { useSession } from "next-auth/react";

interface OIDCDetailsProps {
  oidcConfig: any; // You can define a more specific type if needed
}

export default function OIDCDetails({ oidcConfig }: OIDCDetailsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

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
    <Layout title="OIDC Details - YorkU Secure App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="card">
              <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">🔍 IBM App ID OIDC Configuration</h1>
                <button 
                  onClick={() => router.push("/")}
                  className="btn btn-light btn-sm"
                >
                  Return to Home
                </button>
              </div>
              <div className="card-body">
                <div className="bg-light p-4 rounded">
                  <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {JSON.stringify(oidcConfig, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps<OIDCDetailsProps> = async () => {
  const oidcConfig = await axios
    .get(`${process.env.APP_ID_ISSUER}/.well-known/openid-configuration`)
    .then((res) => res.data)
    .catch((err) => ({ error: "Failed to fetch OIDC details" }));

  return { props: { oidcConfig } };
}; 