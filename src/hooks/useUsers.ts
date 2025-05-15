import { useState, useEffect } from "react";
import { db, auth } from "../config/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  getDoc,
} from "firebase/firestore";
import { toast } from "sonner";
import { format } from "date-fns";

export interface User {
  id: string;
  email: string;
  role: string | "superAdmin" | "admin" | "client";
  name?: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  createdAt?: Date;
  lastLogin?: Date;
  isBlocked?: boolean;
}

interface UseUsersReturn {
  users: User[];
  isLoading: boolean;
  currentUser: string | null;
  currentUserRole: string | null;
  fetchUsers: () => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<boolean>;
  toggleUserBlockStatus: (
    userId: string,
    currentStatus: boolean
  ) => Promise<boolean>;
  formatDate: (date: Date | undefined) => string;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get current user id and role
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setCurrentUser(user.uid);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setCurrentUserRole(userDoc.data().role as string);
        }
      }
    });

    fetchUsers();

    return () => unsubscribe();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const usersQuery = query(collection(db, "users"), orderBy("email"));
      const querySnapshot = await getDocs(usersQuery);
      const usersList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        // Convert Firestore timestamps to Date objects
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : data.createdAt,
          lastLogin: data.lastLogin?.toDate
            ? data.lastLogin.toDate()
            : data.lastLogin,
          isBlocked: data.isBlocked || false,
        } as User;
      });
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (
    userId: string,
    role: string
  ): Promise<boolean> => {
    try {
      // Only allow role changes for superAdmin
      if (currentUserRole !== "superAdmin") {
        toast.error("Only Super Admins can change user roles");
        return false;
      }

      await updateDoc(doc(db, "users", userId), { role });

      // Update local state
      setUsers(
        users.map((user) => (user.id === userId ? { ...user, role } : user))
      );

      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
      return false;
    }
  };

  const toggleUserBlockStatus = async (
    userId: string,
    currentStatus: boolean
  ): Promise<boolean> => {
    try {
      // Prevent blocking yourself
      if (userId === currentUser) {
        toast.error("You cannot block your own account");
        return false;
      }

      // Check permissions
      const userToUpdate = users.find((user) => user.id === userId);
      if (!userToUpdate) return false;

      if (
        currentUserRole === "admin" &&
        (userToUpdate.role === "admin" || userToUpdate.role === "superAdmin")
      ) {
        toast.error(
          "Regular admins cannot modify admin or super admin accounts"
        );
        return false;
      }

      const newBlockedStatus = !currentStatus;
      await updateDoc(doc(db, "users", userId), {
        isBlocked: newBlockedStatus,
      });

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isBlocked: newBlockedStatus } : user
        )
      );

      return true;
    } catch (error) {
      console.error("Error toggling user block status:", error);
      toast.error("Failed to update user status");
      return false;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    try {
      return format(date, "MMM d, yyyy h:mm a");
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return "Invalid date";
    }
  };

  return {
    users,
    isLoading,
    currentUser,
    currentUserRole,
    fetchUsers,
    updateUserRole,
    toggleUserBlockStatus,
    formatDate,
  };
};

export default useUsers;
