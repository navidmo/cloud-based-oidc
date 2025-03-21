/**
 * This file implements the profile page of the application, providing a secure interface for users
 * to view and manage their account information. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side access control to ensure only authorized users can view
 * their profile details.
 * 
**/
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

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
    return null;
  }

  return (
    <Layout title="Profile - YorkU Secure App">
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">Profile Management</h1>
              </div>
              
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-body">
                        <h2 className="h5 mb-3">Personal Information</h2>
                        <dl className="row">
                          <dt className="col-sm-4">Name</dt>
                          <dd className="col-sm-8">{session.user.name}</dd>
                          
                          <dt className="col-sm-4">Email</dt>
                          <dd className="col-sm-8">
                            {session.user.email}
                            {session.user.email_verified && (
                              <span className="badge bg-success ms-2">Verified</span>
                            )}
                          </dd>
                          
                          <dt className="col-sm-4">User ID</dt>
                          <dd className="col-sm-8">{session.user.id}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card mb-4">
                      <div className="card-body">
                        <h2 className="h5 mb-3">Roles & Permissions</h2>
                        <div className="mb-3">
                          {session.user.roles?.length ? (
                            <div className="d-flex flex-wrap gap-2">
                              {session.user.roles.map((role) => (
                                <span key={role.id} className="badge bg-info">
                                  {role.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">No special roles assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card mb-4">
                  <div className="card-body">
                    <h2 className="h5 mb-3">Identity Providers</h2>
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Provider</th>
                            <th>ID</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {session.user.identities?.map((identity) => (
                            <tr key={identity.id}>
                              <td>{identity.provider}</td>
                              <td>{identity.id}</td>
                              <td>
                                <span className="badge bg-success">Active</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-between">
                  <a href="/" className="btn btn-outline-primary">
                    Return to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 