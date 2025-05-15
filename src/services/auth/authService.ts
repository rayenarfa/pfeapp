import { auth, db } from "../../config/firebase/firebaseConfig";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

// Define the role type to ensure only valid roles are assigned
type UserRole = "superAdmin" | "admin" | "client";

/**
 * Creates a new user account with email and password
 * Also stores user data in Firestore with the specified role
 *
 * @param email - User's email address
 * @param password - User's password
 * @param role - User's role (defaults to "client")
 * @returns Promise resolving to the created User object
 * @throws Error if sign up fails
 */
export const signUp = async (
  email: string,
  password: string,
  role: UserRole = "client"
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Store additional user data including role in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      role,
    });

    console.log("User created and role assigned:", role);
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};
