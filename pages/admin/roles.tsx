/**
 * This file implements the role management interface for administrators, providing functionality to view,
 * edit, and manage user roles within the application. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side role-based access control to ensure only administrators can
 * access and modify role settings.
 * 
 * The component includes a comprehensive role management system that displays role details including
 * permissions, descriptions, and user counts. It implements state management through React hooks to
 * handle role selection, editing capabilities, and real-time updates to role configurations, while
 * maintaining a clean and intuitive user interface using Bootstrap styling.
 * 
 * For development purposes, the component currently uses mock data to demonstrate the role management
 * functionality, which will be replaced with actual API calls in future implementations. The interface
 * includes security measures through useEffect hooks that verify user sessions and admin privileges,
 * redirecting unauthorized users appropriately.
 */


import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

// Mock data - we replace with actual API call in our future labs that we will use to get the roles from a database
const mockRoles: Role[] = [
  {
    id: "1",
    name: "admin",
    description: "Full system access with all permissions",
    permissions: ["manage_users", "manage_roles", "view_audit_logs", "manage_settings"],
    userCount: 3
  },
  {
    id: "2",
    name: "staff",
    description: "Access to staff-specific features and user management",
    permissions: ["view_users", "manage_basic_settings"],
    userCount: 8
  },
  {
    id: "3",
    name: "user",
    description: "Basic user access",
    permissions: ["view_profile", "update_profile"],
    userCount: 45
  }
];

export default function RoleManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
  };

  return (
    <Layout title="Role Management - YorkU Secure App">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">Role Management</h1>
                <button className="btn btn-light btn-sm">
                  + Create New Role
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Role Name</th>
                        <th>Description</th>
                        <th>Users</th>
                        <th>Permissions</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map((role) => (
                        <tr key={role.id}>
                          <td>
                            <span className="fw-bold">{role.name}</span>
                          </td>
                          <td>{role.description}</td>
                          <td>
                            <span className="badge bg-info">
                              {role.userCount} users
                            </span>
                          </td>
                          <td>
                            <div style={{ maxWidth: "200px" }}>
                              {role.permissions.map((permission, index) => (
                                <span
                                  key={permission}
                                  className="badge bg-secondary me-1 mb-1"
                                >
                                  {permission}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditRole(role)}
                              >
                                Edit
                              </button>
                              <button className="btn btn-sm btn-outline-danger">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">Role Statistics</h2>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h3 className="h6">User Distribution</h3>
                  <div className="progress mb-2">
                    <div
                      className="progress-bar bg-primary"
                      style={{ width: "5%" }}
                      title="Admin users"
                    >
                      5%
                    </div>
                    <div
                      className="progress-bar bg-success"
                      style={{ width: "15%" }}
                      title="Staff users"
                    >
                      15%
                    </div>
                    <div
                      className="progress-bar bg-info"
                      style={{ width: "80%" }}
                      title="Regular users"
                    >
                      80%
                    </div>
                  </div>
                  <small className="text-muted">
                    Based on current user role assignments
                  </small>
                </div>
                <div>
                  <h3 className="h6">Recent Role Changes</h3>
                  <ul className="list-unstyled small text-muted">
                    <li>• Added new permission to Staff role (2 days ago)</li>
                    <li>• Created Custom Role (5 days ago)</li>
                    <li>• Updated Admin permissions (1 week ago)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">Role Management Tips</h2>
              </div>
              <div className="card-body">
                <div className="alert alert-info">
                  <h3 className="h6">Best Practices</h3>
                  <ul className="small mb-0">
                    <li>Follow the principle of least privilege</li>
                    <li>Regularly review role assignments</li>
                    <li>Document role changes and reasons</li>
                    <li>Test new permissions before deployment</li>
                  </ul>
                </div>
                <div>
                  <h3 className="h6">Need Help?</h3>
                  <p className="small text-muted mb-0">
                    Check the documentation for detailed information about role management
                    or contact the system administrator for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isEditing && selectedRole && (
          <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit Role: {selectedRole.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedRole(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Role Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedRole.name}
                        readOnly={selectedRole.name === "admin"}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        defaultValue={selectedRole.description}
                      ></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Permissions</label>
                      <div className="form-check">
                        {selectedRole.permissions.map(permission => (
                          <div key={permission}>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`permission-${permission}`}
                              checked
                              readOnly={selectedRole.name === "admin"}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`permission-${permission}`}
                            >
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedRole(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-backdrop fade show"></div>
          </div>
        )}
      </div>
    </Layout>
  );
} 