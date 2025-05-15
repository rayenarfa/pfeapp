import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthUser } from "../../../hooks/useAuth";
import { UserAvatar } from "./UserAvatar";

interface UserMenuProps {
  user: AuthUser;
  role: string | null;
  userMenuItems: {
    path: string;
    label: string;
    icon: string;
  }[];
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  role,
  userMenuItems,
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <UserAvatar user={user} size="md" />
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
        >
          {/* User info */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-violet-50">
            <div className="flex items-center space-x-3">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {user.displayName || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {role && (
                  <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            {userMenuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 mr-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            ))}

            {/* Admin dashboard link if user is admin */}
            {(role === "admin" || role === "superAdmin") && (
              <Link
                to="/admin/dashboard"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                onClick={() => setIsOpen(false)}
              >
                <svg
                  className="w-4 h-4 mr-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Logout */}
          <div className="py-1">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-rose-600"
            >
              <svg
                className="w-4 h-4 mr-3 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
