/**
 * This Layout component serves as the main structural wrapper for the application, providing consistent styling,
 * navigation, and authentication state management across all pages. It utilizes Next.js features like Head for
 * document metadata management and useSession for authentication state handling, while also implementing role-based
 * access control through user role checks (admin and staff).
 * 
 * The component incorporates Bootstrap for styling and responsive design, featuring a header with our Lassonde
 * School of Engineering YorkU logo and a navigation bar. It accepts children components and an optional title 
 * prop, making it flexible for different page requirements while maintaining a consistent user interface 
 * throughout the application.
 */

import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title = "YorkU Secure App" }: LayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.roles?.some(role => role.name === "admin");
  const isStaff = session?.user?.roles?.some(role => role.name === "staff");

  return (
    <>
      <Head>
        <title>{title}</title>
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet"
        />
      </Head>

      <div className="container-fluid bg-white py-3">
        <div className="container text-center">
          <img 
            src="/lassonde.png" 
            alt="Lassonde School of Engineering"
            style={{
              width: "80%",
              height: "auto",
              maxWidth: "800px"
            }}
          />
        </div>
      </div>

      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <a className="navbar-brand" href="/">YorkU Secure App</a>
          
          {session && (
            <>
              <button 
                className="navbar-toggler" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <a 
                      className={`nav-link ${router.pathname === "/dashboard" ? "active" : ""}`}
                      href="/dashboard"
                    >
                      Dashboard
                    </a>
                  </li>
                  
                  {isAdmin && (
                    <li className="nav-item dropdown">
                      <a 
                        className="nav-link dropdown-toggle" 
                        href="#" 
                        role="button" 
                        data-bs-toggle="dropdown"
                      >
                        Admin
                      </a>
                      <ul className="dropdown-menu">
                        <li>
                          <a className="dropdown-item" href="/admin">Dashboard</a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/admin/users">Users</a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/admin/roles">Roles</a>
                        </li>
                        <li>
                          <a className="dropdown-item" href="/admin/audit">Audit Log</a>
                        </li>
                      </ul>
                    </li>
                  )}

                  {isStaff && (
                    <li className="nav-item">
                      <a 
                        className={`nav-link ${router.pathname === "/staff" ? "active" : ""}`}
                        href="/staff"
                      >
                        Staff
                      </a>
                    </li>
                  )}

                  <li className="nav-item">
                    <a 
                      className={`nav-link ${router.pathname === "/reports" ? "active" : ""}`}
                      href="/reports"
                    >
                      Reports
                    </a>
                  </li>

                  <li className="nav-item">
                    <a 
                      className={`nav-link ${router.pathname === "/activity-log" ? "active" : ""}`}
                      href="/activity-log"
                    >
                      Activity
                    </a>
                  </li>

                  <li className="nav-item">
                    <a 
                      className={`nav-link ${router.pathname === "/help" ? "active" : ""}`}
                      href="/help"
                    >
                      Help
                    </a>
                  </li>
                </ul>

                <ul className="navbar-nav">
                  <li className="nav-item dropdown">
                    <a 
                      className="nav-link dropdown-toggle" 
                      href="#" 
                      role="button" 
                      data-bs-toggle="dropdown"
                    >
                      {session.user.name || session.user.email}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <a className="dropdown-item" href="/profile">Profile</a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/settings">Settings</a>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <a className="dropdown-item" href="/api/auth/signout">Logout</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="py-4">
        {children}
      </main>

      <footer className="bg-light py-3 mt-auto">
        <div className="container text-center">
          <p className="text-muted mb-0">
            &copy; {new Date().getFullYear()} Navid Mohaghegh. All rights reserved.
          </p>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    </>
  );
} 