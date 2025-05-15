import { useState, useEffect } from "react";
import { auth, db } from "../config/firebase/firebaseConfig";
import { getDoc, doc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: string | null;
  isBlocked?: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  logout: () => Promise<void>;
}

/**
 * Custom hook for authentication state management
 * Handles user authentication state, role-based access control,
 * and provides authentication-related functionality
 *
 * @returns Authentication state and methods
 */
export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Effect to handle authentication state changes
   * 1. Checks for cached user data to minimize Firestore reads
   * 2. Sets up Firebase auth state listener
   * 3. Fetches additional user data from Firestore when auth state changes
   * 4. Updates local state and localStorage cache
   */
  useEffect(() => {
    // Check for cached user data to avoid unnecessary Firestore reads
    const storedUserData = localStorage.getItem("userData");
    const cachedUser = storedUserData ? JSON.parse(storedUserData) : null;

    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userData = await getUserData(firebaseUser);
          setUser(userData);

          // Cache user data
          localStorage.setItem("userData", JSON.stringify(userData));
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(createBasicUserObject(firebaseUser));
        }
      } else {
        setUser(null);
        localStorage.removeItem("userData");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Fetches extended user data from Firestore
   * Combines Firebase auth data with additional user information from Firestore
   *
   * @param firebaseUser - Firebase auth user object
   * @returns Enhanced user object with additional data
   */
  const getUserData = async (firebaseUser: FirebaseUser): Promise<AuthUser> => {
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || userData.name || null,
        photoURL: firebaseUser.photoURL,
        role: userData.role || "client",
        isBlocked: userData.isBlocked || false,
      };
    }

    return createBasicUserObject(firebaseUser);
  };

  /**
   * Creates a basic user object when Firestore data is not available
   * Provides default values for required fields
   *
   * @param firebaseUser - Firebase auth user object
   * @returns Basic user object with default values
   */
  const createBasicUserObject = (firebaseUser: FirebaseUser): AuthUser => {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      role: "client",
      isBlocked: false,
    };
  };

  /**
   * Signs out the current user
   * Clears authentication state and local storage
   *
   * @throws Error if sign out fails
   */
  const logout = async (): Promise<void> => {
    try {
      await auth.signOut();
      localStorage.removeItem("userData");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  // Check if user is an admin
  const isAdmin = Boolean(
    user?.role === "admin" || user?.role === "superAdmin"
  );

  // Check if user is a super admin
  const isSuperAdmin = Boolean(user?.role === "superAdmin");

  return {
    user,
    loading,
    isAdmin,
    isSuperAdmin,
    logout,
  };
};

export default useAuth;
