/**
 * This file implements the activity log interface, providing functionality to view and monitor user
 * activities and system events within the application. It utilizes Next.js features and next-auth for
 * authentication, implementing client-side access control to ensure only authorized users can view
 * their relevant activity logs.
 * 
 * The component includes a comprehensive logging system that displays activity details including
 * event type, description, timestamp, and additional metadata such as IP address, browser information,
 * and location data. It implements state management through React hooks to handle activity log data
 * while maintaining a clean and intuitive user interface using Bootstrap styling.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  details?: {
    ip?: string;
    browser?: string;
    location?: string;
    status?: string;
  };
}

// Mock data - replace with actual API call
const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    type: "login",
    description: "Successful login",
    timestamp: new Date().toISOString(),
    details: {
      ip: "192.168.1.1",
      browser: "Chrome",
      location: "Toronto, ON",
      status: "success"
    }
  },
  {
    id: "2",
    type: "settings",
    description: "Updated notification preferences",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: {
      status: "success"
    }
  },
  {
    id: "3",
    type: "profile",
    description: "Viewed profile information",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    details: {
      browser: "Chrome",
      status: "success"
    }
  }
];

export default function ActivityLogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  const filteredLogs = activityLogs.filter(log => {
    if (filter === "all") return true;
    return log.type === filter;
  });

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
    <Layout title="Activity Log - YorkU Secure App">
      <div className="container">
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h1 className="h4 mb-0">Activity Log</h1>
                <div className="btn-group">
                  <button
                    className={`btn btn-sm ${filter === "all" ? "btn-light" : "btn-primary"}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`btn btn-sm ${filter === "login" ? "btn-light" : "btn-primary"}`}
                    onClick={() => setFilter("login")}
                  >
                    Login
                  </button>
                  <button
                    className={`btn btn-sm ${filter === "settings" ? "btn-light" : "btn-primary"}`}
                    onClick={() => setFilter("settings")}
                  >
                    Settings
                  </button>
                  <button
                    className={`btn btn-sm ${filter === "profile" ? "btn-light" : "btn-primary"}`}
                    onClick={() => setFilter("profile")}
                  >
                    Profile
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Details</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <small className="text-muted">
                              {new Date(log.timestamp).toLocaleString()}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${getBadgeColor(log.type)}`}>
                              {log.type}
                            </span>
                          </td>
                          <td>{log.description}</td>
                          <td>
                            <small>
                              {log.details?.browser && `${log.details.browser} • `}
                              {log.details?.ip && `${log.details.ip} • `}
                              {log.details?.location && log.details.location}
                            </small>
                          </td>
                          <td>
                            <span className={`badge bg-${log.details?.status === "success" ? "success" : "danger"}`}>
                              {log.details?.status || "unknown"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <small className="text-muted">
                  Showing {filteredLogs.length} activities
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">Activity Summary</h2>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h3 className="h6">Recent Activity Types</h3>
                  <div className="progress">
                    <div 
                      className="progress-bar bg-primary" 
                      style={{ width: "40%" }}
                      title="Login activities"
                    >
                      40%
                    </div>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: "35%" }}
                      title="Profile activities"
                    >
                      35%
                    </div>
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: "25%" }}
                      title="Settings activities"
                    >
                      25%
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="h6">Activity Trends</h3>
                  <p className="small text-muted">
                    Most active time: 2:00 PM - 4:00 PM
                    <br />
                    Most common activity: Login
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6 mb-4">
            <div className="card h-100">
              <div className="card-header">
                <h2 className="h5 mb-0">Security Overview</h2>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <h3 className="h6">Login Locations</h3>
                  <p className="small text-muted">
                    Primary location: Toronto, ON
                    <br />
                    Last unusual location: None detected
                  </p>
                </div>
                <div>
                  <h3 className="h6">Security Recommendations</h3>
                  <ul className="small text-muted">
                    <li>Enable two-factor authentication</li>
                    <li>Review recent device access</li>
                    <li>Update security preferences</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function getBadgeColor(type: string): string {
  switch (type) {
    case "login":
      return "primary";
    case "settings":
      return "info";
    case "profile":
      return "success";
    default:
      return "secondary";
  }
} 