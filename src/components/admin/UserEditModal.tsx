import React from "react";
import { User } from "../../hooks/useUsers";
import { Shield, ChevronDown } from "lucide-react";
import {
  BaseModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../components/ui";

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (updatedUser: User) => void;
  currentUserRole: string | null;
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  onChange,
  currentUserRole,
}) => {
  if (!isOpen || !user) return null;

  const isSuperAdmin = currentUserRole === "superAdmin";

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!user) return;
    onChange({ ...user, role: e.target.value });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalHeader title="Edit User" onClose={onClose} />

      <ModalBody>
        <p className="text-sm text-gray-500 mb-6">
          Update {user.displayName || user.email}'s details
        </p>

        <div className="space-y-5">
          <div className="flex space-x-4">
            <div
              className={`h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-semibold text-xl ${
                user.photoURL ? "p-0" : ""
              }`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="User"
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                user.email?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-800">
                {user.displayName || user.name || "No Name"}
              </h4>
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="text-xs mt-1 text-gray-400">
                User ID: {user.id}
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
            <label className="text-sm font-semibold text-indigo-700 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              User Role
              {!isSuperAdmin && (
                <span className="ml-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  Super Admin only
                </span>
              )}
            </label>
            <div className="relative">
              <select
                value={user.role}
                onChange={handleRoleChange}
                disabled={!isSuperAdmin}
                className={`w-full appearance-none bg-white border border-indigo-200 rounded-lg px-4 py-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium ${
                  !isSuperAdmin ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                <option value="client">Client</option>
                {isSuperAdmin && (
                  <>
                    <option value="admin">Admin</option>
                    <option value="superAdmin">Super Admin</option>
                  </>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-500">
                <ChevronDown className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-xs text-indigo-600">
              {user.role === "superAdmin"
                ? "Super Admin users have complete control over the application and can manage all users and settings."
                : user.role === "admin"
                ? "Admin users have access to manage products, orders, and client users."
                : "Client users have access to shop and place orders only."}
            </p>
            {!isSuperAdmin && (
              <p className="mt-2 text-xs text-amber-600">
                Only Super Admins can change user roles
              </p>
            )}
          </div>
        </div>
      </ModalBody>

      <ModalFooter
        onCancel={onClose}
        onConfirm={onSave}
        cancelLabel="Cancel"
        confirmLabel="Save Changes"
      />
    </BaseModal>
  );
};

export default UserEditModal;
