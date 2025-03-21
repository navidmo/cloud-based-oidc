/**
 * This file implements the settings page of the application, providing users with a centralized interface
 * to manage their application preferences and configurations. It utilizes Next.js features and next-auth
 * for authentication, implementing client-side access control to ensure only authorized users can access
 * and modify their settings.
 * 
 * The implementation includes a tabbed interface for organizing different setting categories, proper
 * session management, and loading state handling. It follows responsive design principles using Bootstrap
 * classes and implements proper type checking and error handling to ensure a robust user experience
 * while managing application settings.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("preferences");

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
    <Layout title="Settings - YorkU Secure App">
      <div className="container">
        <div className="row">
          <div className="col-md-3 mb-4">
            <div className="card">
              <div className="card-body">
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "preferences" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("preferences")}
                  >
                    Preferences
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "notifications" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    Notifications
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "security" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("security")}
                  >
                    Security
                  </button>
                  <button
                    className={`list-group-item list-group-item-action ${
                      activeTab === "appearance" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("appearance")}
                  >
                    Appearance
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="card">
              <div className="card-body">
                {activeTab === "preferences" && (
                  <div>
                    <h2 className="h5 mb-4">General Preferences</h2>
                    <form>
                      <div className="mb-3">
                        <label className="form-label">Language</label>
                        <select className="form-select">
                          <option value="en">English</option>
                          <option value="fr">French</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Time Zone</label>
                        <select className="form-select">
                          <option value="UTC">UTC</option>
                          <option value="EST">Eastern Time</option>
                          <option value="PST">Pacific Time</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailUpdates"
                          />
                          <label className="form-check-label" htmlFor="emailUpdates">
                            Receive email updates
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Save Preferences
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "notifications" && (
                  <div>
                    <h2 className="h5 mb-4">Notification Settings</h2>
                    <form>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="loginNotifications"
                          />
                          <label className="form-check-label" htmlFor="loginNotifications">
                            Login notifications
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="securityAlerts"
                          />
                          <label className="form-check-label" htmlFor="securityAlerts">
                            Security alerts
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="newsUpdates"
                          />
                          <label className="form-check-label" htmlFor="newsUpdates">
                            News and updates
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Save Notification Settings
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "security" && (
                  <div>
                    <h2 className="h5 mb-4">Security Settings</h2>
                    <form>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="twoFactor"
                          />
                          <label className="form-check-label" htmlFor="twoFactor">
                            Enable two-factor authentication
                          </label>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="sessionTimeout"
                          />
                          <label className="form-check-label" htmlFor="sessionTimeout">
                            Enable session timeout
                          </label>
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="form-label">Session Timeout Duration</label>
                        <select className="form-select">
                          <option value="15">15 minutes</option>
                          <option value="30">30 minutes</option>
                          <option value="60">1 hour</option>
                        </select>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Save Security Settings
                      </button>
                    </form>
                  </div>
                )}

                {activeTab === "appearance" && (
                  <div>
                    <h2 className="h5 mb-4">Appearance Settings</h2>
                    <form>
                      <div className="mb-3">
                        <label className="form-label">Theme</label>
                        <select className="form-select">
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="system">System Default</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Font Size</label>
                        <select className="form-select">
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="animations"
                          />
                          <label className="form-check-label" htmlFor="animations">
                            Enable animations
                          </label>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary">
                        Save Appearance Settings
                      </button>
                    </form>
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