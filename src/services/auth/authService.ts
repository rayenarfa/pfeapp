import { auth, db } from "../../config/firebase/firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  User, 
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  verifyBeforeUpdateEmail
} from "firebase/auth";
import { doc, setDoc, deleteDoc } from "firebase/firestore";

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

/**
 * Sends a password reset email to the specified email address
 * Uses Firebase's password reset functionality
 * 
 * @param email - The email address to send the password reset link to
 * @returns Promise that resolves when the email has been sent
 * @throws Error if the operation fails
 */
export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

// Note: We don't need a confirmPasswordReset function as Firebase handles this directly
// through its own UI when user clicks on the reset link in their email

/**
 * Updates a user's email address by sending a verification link first
 * 
 * @param newEmail - The new email address to set for the user
 * @returns Promise that resolves when the verification email has been sent
 * @throws Error if the operation fails
 */
export const updateUserEmail = async (newEmail: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    // Send verification email to the new address before updating
    await verifyBeforeUpdateEmail(user, newEmail);
    console.log(`Verification email sent to ${newEmail}`);
    
    // Note: The email won't actually be updated until the user clicks the verification link
    return Promise.resolve();
  } catch (error) {
    console.error("Error updating email:", error);
    throw error;
  }
};

/**
 * Deletes a user account after password reauthentication
 * 
 * This requires recent authentication, so the user must provide their password
 * to verify their identity before their account can be deleted
 *
 * @param password - User's current password for verification
 * @returns Promise that resolves when the account is deleted
 * @throws Error if reauthentication fails or deletion fails
 */
export const deleteUserAccount = async (password: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user || !user.email) {
      throw new Error("No authenticated user found or user has no email");
    }
    
    // Create credential for reauthentication
    const credential = EmailAuthProvider.credential(user.email, password);
    
    // Reauthenticate user with provided password
    await reauthenticateWithCredential(user, credential);
    
    // Delete user document from Firestore first
    try {
      await deleteDoc(doc(db, "users", user.uid));
      // Add any other collections cleanup here
      // For example: orders, payments, etc.
      
      console.log("User data deleted from Firestore");
    } catch (firestoreError) {
      console.error("Error deleting user data from Firestore:", firestoreError);
      // Continue with account deletion even if Firestore deletion fails
    }
    
    // Delete the user account from Firebase Authentication
    await deleteUser(user);
    console.log("User account successfully deleted");
  } catch (error) {
    console.error("Error deleting user account:", error);
    
    // Provide more specific error messages for common scenarios
    if (error instanceof Error) {
      if (error.message.includes("auth/wrong-password")) {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.message.includes("auth/requires-recent-login")) {
        throw new Error("For security reasons, please sign in again before deleting your account.");
      } else {
        throw error;
      }
    } else {
      throw new Error("Failed to delete account. Please try again later.");
    }
  }
};

