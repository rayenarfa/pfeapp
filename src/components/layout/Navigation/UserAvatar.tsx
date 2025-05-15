import React from "react";
import { AuthUser } from "../../../hooks/useAuth";

interface UserAvatarProps {
  user: AuthUser;
  size?: "sm" | "md" | "lg";
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
}) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  // If user has a photo URL, display it
  if (user.photoURL) {
    return (
      <img
        src={user.photoURL}
        alt={user.displayName || "User avatar"}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
      />
    );
  }

  // Otherwise, display a gradient background with first letter
  const firstLetter = (
    user.displayName?.charAt(0) ||
    user.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white flex items-center justify-center font-semibold shadow-sm`}
      title={user.displayName || user.email || "User"}
    >
      {firstLetter}
    </div>
  );
};

export default UserAvatar;
