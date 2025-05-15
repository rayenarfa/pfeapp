import React from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { CartIndicator } from "./CartIndicator";
import { AuthUser } from "../../../hooks/useAuth";

interface MobileNavProps {
  user: AuthUser | null;
  isOpen: boolean;
  onToggle: () => void;
  cartItemCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onToggle,
  cartItemCount,
}) => {
  return (
    <div className="flex md:hidden items-center justify-between w-full">
      {/* Logo */}
      <Link
        to="/"
        className="font-bold text-xl text-indigo-600 flex items-center"
      >
        SharePay
      </Link>

      {/* Mobile menu toggler and icons */}
      <div className="flex items-center">
        <div className="flex items-center justify-center">
          <CartIndicator count={cartItemCount} />
        </div>

        <button
          onClick={onToggle}
          className="ml-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export const MobileMenuOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  user: AuthUser | null;
  role: string | null;
  menuItems: {
    path: string;
    label: string;
    icon: string;
  }[];
  userMenuItems: {
    path: string;
    label: string;
    icon: string;
  }[];
  onLogout: () => void;
}> = ({ isOpen, onClose, user, role, menuItems, userMenuItems, onLogout }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Dark overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Mobile menu */}
      <div className="fixed top-0 right-0 h-screen w-4/5 max-w-xs bg-white shadow-2xl z-50 md:hidden flex flex-col rounded-l-2xl overflow-hidden">
        {/* Menu header */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-violet-50">
          <div className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            SharePay
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-indigo-600 rounded-full hover:bg-white/50 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Menu content */}
        <div className="flex-1 overflow-y-auto">
          {/* User profile section */}
          {user && (
            <div className="px-5 py-4 border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <UserAvatar user={user} size="md" />
                <div>
                  <p className="font-medium text-gray-800">
                    {user.displayName || user.email?.split("@")[0] || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {user.email}
                  </p>
                  {role && (
                    <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main navigation links */}
          <div className="px-3 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
              Navigation
            </h3>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                  onClick={onClose}
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* User menu items */}
          {user ? (
            <div className="px-3 py-2 border-t border-gray-100">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                Account
              </h3>
              <nav className="space-y-1">
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                    <span>{item.label}</span>
                  </Link>
                ))}

                {/* Admin dashboard link */}
                {(role === "admin" || role === "superAdmin") && (
                  <Link
                    to="/admin/dashboard"
                    className="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <svg
                      className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex w-full items-center justify-start px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 hover:text-rose-600 transition-colors duration-200"
                >
                  <svg
                    className="w-5 h-5 mr-3 text-gray-500 flex-shrink-0"
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
                  <span>Sign Out</span>
                </button>
              </nav>
            </div>
          ) : (
            <div className="px-3 py-2 border-t border-gray-100">
              <div className="flex flex-col space-y-2 px-4 py-3">
                <Link
                  to="/signin"
                  className="w-full py-2.5 px-4 text-center text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center"
                  onClick={onClose}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="w-full py-2.5 px-4 text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
                  onClick={onClose}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNav;
