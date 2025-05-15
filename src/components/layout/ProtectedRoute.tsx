import { useEffect, useState, ReactNode } from "react";
import { auth, db } from "../../config/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  roleRequired: string;
}

/**
 * ProtectedRoute component for role-based access control
 * Controls access to routes based on user authentication status and role
 * Redirects unauthorized users to appropriate pages
 * @param children - Components to render if access is granted
 * @param roleRequired - Role required to access the route (user, admin, superAdmin)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roleRequired,
}) => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  /**
   * Authentication effect that:
   * 1. Listens for auth state changes
   * 2. Checks if user is authenticated
   * 3. Fetches and verifies user role from Firestore if needed
   * 4. Updates component state based on auth status
   */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsAuthenticated(true);
        if (roleRequired === "admin" || roleRequired === "superAdmin") {
          // Fetch the role from Firestore if we need to check for admin or superAdmin
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role as string);
          }
        } else {
          // For "user" role, just being authenticated is enough
          setRole("user");
        }
      } else {
        setIsAuthenticated(false);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roleRequired]);

  // Show loading state while checking authentication
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );

  // If roleRequired is "user", just check if the user is authenticated
  if (roleRequired === "user") {
    // If not authenticated, redirect to sign-in with the return URL
    return isAuthenticated ? (
      children
    ) : (
      <Navigate
        to={`/signin?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // Handle admin required routes
  if (roleRequired === "admin") {
    // SuperAdmin can access admin routes
    return role === "admin" || role === "superAdmin" ? (
      children
    ) : (
      <Navigate to="/" replace />
    );
  }

  // Handle superAdmin required routes
  if (roleRequired === "superAdmin") {
    return role === "superAdmin" ? children : <Navigate to="/" replace />;
  }

  // Otherwise, check for exact role match (fallback)
  return role === roleRequired ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
