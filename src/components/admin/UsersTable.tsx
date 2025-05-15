import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  UserX,
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Lock,
  Unlock,
  ShoppingCart,
} from "lucide-react";
import { User as UserType } from "../../hooks/useUsers";

interface UsersTableProps {
  users: UserType[];
  currentUser: string | null;
  currentUserRole: string | null;
  isLoading: boolean;
  onEditUser: (user: UserType) => void;
  onBlockUser: (user: UserType) => void;
  formatDate: (date: Date | undefined) => string;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUser,
  currentUserRole,
  isLoading,
  onEditUser,
  onBlockUser,
  formatDate,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof UserType>("email");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Memoized filtered and sorted users
  const filteredAndSortedUsers = useMemo(() => {
    return [...users]
      .filter((user) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          user.email?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.displayName?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];

        // Handle different types of fields
        const compareResult = (() => {
          // Handle dates
          if (sortField === "createdAt" || sortField === "lastLogin") {
            const dateA = fieldA instanceof Date ? fieldA : new Date(0);
            const dateB = fieldB instanceof Date ? fieldB : new Date(0);
            return dateA.getTime() - dateB.getTime();
          }
          // Handle roles with custom order
          if (sortField === "role") {
            const getRoleValue = (role: string | undefined): number => {
              switch (role) {
                case "superAdmin":
                  return 3;
                case "admin":
                  return 2;
                case "client":
                  return 1;
                default:
                  return 0;
              }
            };
            return getRoleValue(a.role) - getRoleValue(b.role);
          }
          // Handle strings
          if (typeof fieldA === "string" && typeof fieldB === "string") {
            return fieldA.localeCompare(fieldB);
          }
          // Handle booleans
          if (typeof fieldA === "boolean" && typeof fieldB === "boolean") {
            return fieldA === fieldB ? 0 : fieldA ? 1 : -1;
          }
          // Default comparison
          return String(fieldA).localeCompare(String(fieldB));
        })();

        return sortDirection === "asc" ? compareResult : -compareResult;
      });
  }, [users, searchQuery, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: keyof UserType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort icon helper
  const getSortIcon = (field: keyof UserType) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // View user orders
  const viewUserOrders = (userId: string) => {
    navigate(`/admin/orders?userId=${userId}`);
  };

  // User actions dropdown component
  const UserActions = ({ user }: { user: UserType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Can edit if superadmin or if user is a client
    const canEdit =
      currentUserRole === "superAdmin" ||
      !(user.role === "admin" || user.role === "superAdmin");

    // Can block if not self and (superadmin or user is a client)
    const canBlock =
      user.id !== currentUser &&
      (currentUserRole === "superAdmin" ||
        !(user.role === "admin" || user.role === "superAdmin"));

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          aria-label="User actions"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-500" />
        </button>

        {isOpen && (
          <div
            className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-actions-menu"
          >
            <div className="py-1 border-b border-gray-100">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 uppercase flex items-center">
                {user.role === "superAdmin" ? (
                  <>
                    <Shield className="w-3.5 h-3.5 mr-1 text-purple-500" />
                    Super Admin
                  </>
                ) : user.role === "admin" ? (
                  <>
                    <Shield className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    Admin
                  </>
                ) : (
                  <>
                    <User className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Client
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setIsOpen(false);
                viewUserOrders(user.id);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              <ShoppingCart className="h-4 w-4 mr-2 text-amber-500" />
              View Orders
            </button>

            {canEdit ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onEditUser(user);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                Edit User
              </button>
            ) : (
              <div className="flex items-center px-4 py-2 text-sm text-gray-400 bg-gray-50">
                <Edit className="h-4 w-4 mr-2 text-gray-300" />
                <span>Edit User</span>
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                  No Access
                </span>
              </div>
            )}

            {canBlock ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onBlockUser(user);
                }}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                {user.isBlocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2 text-emerald-500" />
                    Unblock User
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2 text-rose-500" />
                    Block User
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center px-4 py-2 text-sm text-gray-400 bg-gray-50">
                {user.isBlocked ? (
                  <>
                    <Unlock className="h-4 w-4 mr-2 text-gray-300" />
                    <span>Unblock User</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2 text-gray-300" />
                    <span>Block User</span>
                  </>
                )}
                <span className="ml-auto text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
                  No Access
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      {/* Search and filter bar */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  <span>User</span>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                  {getSortIcon("email")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center">
                  <span>Role</span>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                  {getSortIcon("role")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center">
                  <span>Joined</span>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                  {getSortIcon("createdAt")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("lastLogin")}
              >
                <div className="flex items-center">
                  <span>Last Active</span>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                  {getSortIcon("lastLogin")}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("isBlocked")}
              >
                <div className="flex items-center">
                  <span>Status</span>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                  {getSortIcon("isBlocked")}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <tr
                  key={user.id}
                  id={`user-${user.id}`}
                  className={`hover:bg-gray-50 ${
                    user.id === currentUser ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          user.email?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.displayName || user.name || "Anonymous User"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "superAdmin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "admin"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role === "superAdmin"
                        ? "Super Admin"
                        : user.role === "admin"
                        ? "Admin"
                        : "Client"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isBlocked ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <UserX className="w-3.5 h-3.5 mr-1" /> Blocked
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <UserActions user={user} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTable;
