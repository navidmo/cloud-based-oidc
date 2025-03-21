/**
 * This file implements the unauthorized access page of the application, serving as a central
 * landing point for users who attempt to access restricted content without proper authentication
 * or authorization. It provides clear feedback to users about their access status and guides
 * them on how to proceed, whether they need to sign in or lack the necessary permissions.
 * 
 * The implementation utilizes next-auth for session management and implements a responsive
 * interface using Bootstrap styling. It dynamically adjusts the displayed message based on
 * the user's authentication status, providing appropriate guidance for both authenticated
 * users lacking permissions and unauthenticated users attempting to access protected routes.
 */

import { useSession } from "next-auth/react";
import Head from "next/head";

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Unauthorized Access - YorkU Secure App</title>
      </Head>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card border-danger">
              <div className="card-header bg-danger text-white">
                <h1 className="h4 mb-0">⚠️ Unauthorized Access</h1>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <p className="lead">
                    {session ? 
                      "You don't have permission to access this page." :
                      "Please sign in to access this page."
                    }
                  </p>
                </div>
                
                <div className="d-grid gap-2">
                  <a href="/" className="btn btn-primary">
                    Return to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 