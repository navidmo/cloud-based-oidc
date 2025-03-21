/**
 * This file implements the admin dashboard page of the application, providing a secure interface for administrators
 * to manage system settings and view privileged information. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side role-based access control to ensure only users with admin privileges
 * can access the dashboard.
 * 
 * The component includes robust security measures through useEffect hooks that check for valid sessions and admin
 * roles, redirecting unauthorized users appropriately. It also provides loading states and uses the Layout
 * component to maintain consistent styling and navigation across the application, while presenting admin-specific
 * functionality through a clean, Bootstrap-styled interface.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Layout from "../../components/Layout";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/unauthorized");
      return;
    }
    const isAdmin = session.user?.roles?.some(role => role.name === "admin");
    if (!isAdmin) {
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
    <Layout title="Admin Dashboard - YorkU Secure App">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h1 className="h4 mb-0">Admin Dashboard</h1>
              </div>
              <div className="card-body">
                <div className="row g-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">👥 User Management</h5>
                        <p className="card-text">Manage users, roles, and permissions</p>
                        <div className="d-grid gap-2">
                          <a href="/admin/users" className="btn btn-outline-primary">
                            Manage Users
                          </a>
                          <a href="/admin/roles" className="btn btn-outline-primary">
                            Manage Roles
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">📊 Analytics</h5>
                        <p className="card-text">View system analytics and reports</p>
                        <div className="d-grid gap-2">
                          <a href="/admin/analytics" className="btn btn-outline-info">
                            View Analytics
                          </a>
                          <a href="/admin/reports" className="btn btn-outline-info">
                            Generate Reports
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <h5 className="card-title">🔒 Security</h5>
                        <p className="card-text">Monitor security and audit logs</p>
                        <div className="d-grid gap-2">
                          <a href="/admin/security" className="btn btn-outline-danger">
                            Security Settings
                          </a>
                          <a href="/admin/audit" className="btn btn-outline-danger">
                            Audit Logs
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">System Overview</h2>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h3 className="h6">Active Users</h3>
                  <div className="progress mb-2">
                    <div
                      className="progress-bar bg-success"
                      style={{ width: "75%" }}
                      title="Active users"
                    >
                      75%
                    </div>
                  </div>
                  <small className="text-muted">45 out of 60 users active this month</small>
                </div>
                <div>
                  <h3 className="h6">Recent Activity</h3>
                  <ul className="list-unstyled small text-muted">
                    <li>• New user registration (10 minutes ago)</li>
                    <li>• Role permission updated (1 hour ago)</li>
                    <li>• Security alert resolved (2 hours ago)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">Quick Actions</h2>
              </div>
              <div className="card-body">
                <div className="list-group">
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Review Pending User Requests
                    <span className="badge bg-primary rounded-pill">4</span>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    Check Security Alerts
                    <span className="badge bg-danger rounded-pill">2</span>
                  </button>
                  <button className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                    System Maintenance
                    <span className="badge bg-warning rounded-pill">1</span>
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