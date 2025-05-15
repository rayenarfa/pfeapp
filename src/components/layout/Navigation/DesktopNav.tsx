import React from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthUser } from "../../../hooks/useAuth";
import { UserMenu } from "./UserMenu";

import { CartIndicator } from "./CartIndicator";

interface NavItemProps {
  path: string;
  label: string;
  icon: string;
  isActive: boolean;
}

interface DesktopNavProps {
  user: AuthUser | null;
  role: string | null;
  cartItemCount: number;
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
}

// NavItem component for desktop
const NavItem: React.FC<NavItemProps> = ({ path, label, icon, isActive }) => {
  return (
    <Link
      to={path}
      className={`px-3 py-2 rounded-lg flex items-center justify-center space-x-1.5 text-sm font-medium transition-colors duration-200 ${
        isActive
          ? "text-indigo-700 bg-indigo-50"
          : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
      }`}
    >
      <svg
        className={`w-5 h-5 flex-shrink-0 ${
          isActive ? "text-indigo-500" : "text-gray-500"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={icon}
        />
      </svg>
      <span>{label}</span>
    </Link>
  );
};

export const DesktopNav: React.FC<DesktopNavProps> = ({
  user,
  role,
  cartItemCount,
  menuItems,
  userMenuItems,
  onLogout,
}) => {
  const location = useLocation();

  // Check if current path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex items-center justify-between w-full">
      {/* Logo */}
      <Link
        to="/"
        className="font-bold text-xl text-indigo-600 flex items-center"
      >
        SharePay
      </Link>

      {/* Main Navigation */}
      <div className="flex items-center space-x-1">
        {menuItems.map((item) => (
          <NavItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.path)}
          />
        ))}
      </div>

      {/* Right Side: Cart, User */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center">
          <CartIndicator count={cartItemCount} />
        </div>

        {user ? (
          <UserMenu
            user={user}
            role={role}
            userMenuItems={userMenuItems}
            onLogout={onLogout}
          />
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/signin"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 flex items-center justify-center"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center justify-center"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopNav;
