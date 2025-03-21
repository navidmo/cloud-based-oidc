/**
 * This file implements the staff dashboard page of the application, providing a secure interface
 * exclusively for staff members. It utilizes Next.js features and next-auth for authentication,
 * implementing role-based access control to ensure only users with staff privileges can access
 * the dashboard and its features.
 * 
 * The implementation includes client-side authentication checks, proper handling of loading states,
 * and unauthorized access attempts. It displays staff-specific information and tools, implementing
 * a clean and responsive interface using Bootstrap styling while maintaining security through
 * continuous session and role verification.
 */

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function StaffPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    
    const isStaff = session?.user?.roles?.some(role => role.name === "staff");
    if (!session || !isStaff) {
      router.push("/unauthorized");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user?.roles?.some(role => role.name === "staff")) {
    return null; // Router will redirect
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h1 className="h4 mb-0">Staff Dashboard</h1>
            </div>
            <div className="card-body">
              <h2 className="h5 mb-4">Welcome, {session.user.name}</h2>
              
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h3 className="h6 mb-3">Staff Information</h3>
                      <p className="mb-2"><strong>Email:</strong> {session.user.email}</p>
                      <p className="mb-2"><strong>Role:</strong> Staff</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <h3 className="h6 mb-3">Quick Actions</h3>
                      <div className="d-grid gap-2">
                        <a href="/" className="btn btn-outline-primary">
                          Return to Home
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
    </div>
  );
} 