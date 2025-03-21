/**
 * This file implements the user management interface for administrators, providing functionality to view,
 * monitor, and manage user accounts within the application. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side role-based access control to ensure only administrators can
 * access and modify user settings.
 * 
 * The component includes a comprehensive user management system that displays user details including
 * roles, status, last login time, and account creation date. It implements state management through
 * React hooks to handle user data and updates, while maintaining a clean and intuitive user interface
 * using Bootstrap styling.
 * 
 * For development purposes, the component currently uses mock data to demonstrate the user management
 * functionality, which will be replaced with actual API calls in future implementations. The interface
 * includes security measures through useEffect hooks that verify user sessions and admin privileges,
 * redirecting unauthorized users appropriately.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  createdAt: string;
}

// Mock data - replace with actual API call
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Admin",
    email: "john@yorku.ca",
    roles: ["admin"],
    status: "active",
    lastLogin: new Date().toISOString(),
    createdAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    name: "Sarah Staff",
    email: "sarah@yorku.ca",
    roles: ["staff"],
    status: "active",
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    createdAt: "2024-01-15T00:00:00Z"
  },
  {
    id: "3",
    name: "Mike User",
    email: "mike@yorku.ca",
    roles: ["user"],
    status: "inactive",
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    createdAt: "2024-02-01T00:00:00Z"
  }
];

export default function UserManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditing(true);
  };

  return (
    <Layout title="User Management - YorkU Secure App">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">User Management</h1>
                <button className="btn btn-light btn-sm">
                  + Add New User
                </button>
              </div>
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="user">User</option>
                    </select>
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Status</th>
                        <th>Last Login</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            {user.roles.map((role) => (
                              <span
                                key={role}
                                className={`badge bg-${getBadgeColor(role)} me-1`}
                              >
                                {role}
                              </span>
                            ))}
                          </td>
                          <td>
                            <span className={`badge bg-${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(user.lastLogin).toLocaleString()}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEditUser(user)}
                              >
                                Edit
                              </button>
                              <button className="btn btn-sm btn-outline-danger">
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <small className="text-muted">
                  Showing {filteredUsers.length} of {users.length} users
                </small>
              </div>
            </div>
          </div>
        </div>

        {isEditing && selectedUser && (
          <div className="modal fade show" style={{ display: "block" }} tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User: {selectedUser.name}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedUser(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={selectedUser.name}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        defaultValue={selectedUser.email}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Roles</label>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="role-admin"
                          checked={selectedUser.roles.includes("admin")}
                        />
                        <label className="form-check-label" htmlFor="role-admin">
                          Admin
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="role-staff"
                          checked={selectedUser.roles.includes("staff")}
                        />
                        <label className="form-check-label" htmlFor="role-staff">
                          Staff
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="role-user"
                          checked={selectedUser.roles.includes("user")}
                        />
                        <label className="form-check-label" htmlFor="role-user">
                          User
                        </label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" defaultValue={selectedUser.status}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedUser(null);
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

function getBadgeColor(role: string): string {
  switch (role) {
    case "admin":
      return "danger";
    case "staff":
      return "success";
    case "user":
      return "primary";
    default:
      return "secondary";
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "success";
    case "inactive":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "secondary";
  }
} 