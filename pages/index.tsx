/**
 * This file implements the main landing page of the application, serving as the entry point for users.
 * It provides authentication status display, role-based navigation options, and core functionality access.
 * The implementation utilizes Next.js features and next-auth for authentication, ensuring secure access
 * control and session management throughout the application.
 * 
 * The component includes conditional rendering based on user authentication status and roles, displaying
 * appropriate navigation options and content for administrators, staff members, and regular users. It
 * implements a clean and responsive user interface using Bootstrap styling, with proper loading states
 * and session handling to ensure a smooth user experience.
 */

import { signIn, signOut, useSession } from "next-auth/react";
import Layout from "../components/Layout";

export default function Home() {
  const { data: session, status } = useSession();

  const isAdmin = session?.user?.roles?.some(role => role.name === "admin");
  const isStaff = session?.user?.roles?.some(role => role.name === "staff");

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

  return (
    <Layout title="YorkU Secure App Demo">
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h1 className="h4 mb-0">YorkU Secure App Demo</h1>
                <p className="small mb-0">Utilizing IBM Cloud AppID, IAM, RBAC, MFA, OTP, and OIDC/OAuth 2.1</p>
              </div>
              
              <div className="card-body">
                {session ? (
                  <>
                    <div className="alert alert-success mb-4">
                      <p className="mb-0">Signed in as {session.user.email}</p>
                    </div>

                    <div className="d-grid gap-3">
                      <a href="/profile" className="btn btn-outline-primary">
                        👤 My Profile
                      </a>
                      
                      <a href="/activity-log" className="btn btn-outline-info">
                        📋 Activity Log
                      </a>
                      
                      <a href="/protected" className="btn btn-outline-primary">
                        🔐 View Protected Page
                      </a>
                      
                      {isAdmin && (
                        <a href="/admin" className="btn btn-outline-danger">
                          👑 Admin Dashboard
                        </a>
                      )}

                      {isStaff && (
                        <a href="/staff" className="btn btn-outline-success">
                          👥 Staff Dashboard
                        </a>
                      )}
                      
                      <a href="/userinfo" className="btn btn-outline-info">
                        👤 View User Info
                      </a>
                      
                      <a href="/oidc-details" className="btn btn-outline-secondary">
                        🔍 View OIDC Details
                      </a>
                      
                      <button 
                        onClick={() => signOut()}
                        className="btn btn-danger"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="mb-4">You are not signed in.</p>
                    <button 
                      onClick={() => signIn("ibm-appid")}
                      className="btn btn-primary btn-lg"
                    >
                      Login with IBM App ID
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 