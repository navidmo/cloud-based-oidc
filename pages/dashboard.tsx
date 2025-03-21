/**
 * This file implements the dashboard page of the application, providing a secure interface for users
 * to view their account information and system status. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side access control to ensure only authorized users can view
 * their relevant dashboard content.
 * 
**/
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../components/Layout";

export default function DashboardPage() {
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

  const isAdmin = session.user.roles?.some(role => role.name === "admin");
  const isStaff = session.user.roles?.some(role => role.name === "staff");

  return (
    <Layout title="Dashboard - YorkU Secure App">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <h1 className="h3 mb-4">Welcome back, {session.user.name}!</h1>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <a href="/profile" className="btn btn-outline-primary btn-sm">
                    View Profile
                  </a>
                  <a href="/activity-log" className="btn btn-outline-info btn-sm">
                    Activity Log
                  </a>
                  {(isAdmin || isStaff) && (
                    <a href="/reports" className="btn btn-outline-success btn-sm">
                      View Reports
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Your Roles</h5>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  {session.user.roles?.map((role) => (
                    <span key={role.id} className="badge bg-info">
                      {role.name}
                    </span>
                  )) || (
                    <span className="text-muted">No special roles assigned</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">Recent Activity</h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <small className="text-muted">Just now</small>
                    <br />
                    Logged in successfully
                  </li>
                  {/* Add more activity items here */}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-3 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">System Status</h5>
                <div className="mb-3">
                  <span className="badge bg-success">All Systems Operational</span>
                </div>
                <small className="text-muted">
                  Last checked: {new Date().toLocaleTimeString()}
                </small>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Admin Quick Access</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="d-grid">
                        <a href="/admin/users" className="btn btn-outline-primary">
                          Manage Users
                        </a>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-grid">
                        <a href="/admin/roles" className="btn btn-outline-primary">
                          Manage Roles
                        </a>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-grid">
                        <a href="/admin/audit" className="btn btn-outline-primary">
                          View Audit Log
                        </a>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="d-grid">
                        <a href="/reports" className="btn btn-outline-primary">
                          System Reports
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isStaff && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Staff Tools</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <div className="d-grid">
                        <a href="/staff" className="btn btn-outline-success">
                          Staff Dashboard
                        </a>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-grid">
                        <a href="/reports" className="btn btn-outline-success">
                          View Reports
                        </a>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3">
                      <div className="d-grid">
                        <a href="/activity-log" className="btn btn-outline-success">
                          Activity Log
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 