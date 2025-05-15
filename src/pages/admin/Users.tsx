import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import UsersTable from "../../components/admin/UsersTable";
import UserEditModal from "../../components/admin/UserEditModal";
import ConfirmDialog from "../../components/ui/modals/ConfirmDialog";
import { useUsers, User } from "../../hooks/useUsers";
import { UserX, ShieldAlert } from "lucide-react";

const UsersDashboard: React.FC = () => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [userToBlock, setUserToBlock] = useState<User | null>(null);
  const location = useLocation();

  // Use our custom hook for user data and operations
  const {
    users,
    isLoading,
    currentUser,
    currentUserRole,
    updateUserRole,
    toggleUserBlockStatus,
    formatDate,
  } = useUsers();

  useEffect(() => {
    // Check for userId in query params to highlight the user
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    if (userId) {
      // Scroll to the user row or add some highlight
      setTimeout(() => {
        const userRow = document.getElementById(`user-${userId}`);
        if (userRow) {
          userRow.scrollIntoView({ behavior: "smooth", block: "center" });
          userRow.classList.add("bg-yellow-50");
          setTimeout(() => {
            userRow.classList.remove("bg-yellow-50");
            userRow.classList.add("bg-white");
          }, 2000);
        }
      }, 500);
    }
  }, [location]);

  // Handler for user edit
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  // Handler for user block
  const handleBlockUser = (user: User) => {
    setUserToBlock(user);
    setIsBlockModalOpen(true);
  };

  // Save user changes
  const saveUserChanges = async () => {
    if (!editingUser) return;

    const success = await updateUserRole(editingUser.id, editingUser.role);

    if (success) {
      toast.success(`User ${editingUser.email} updated successfully.`);
      setIsEditModalOpen(false);
      setEditingUser(null);
    }
  };

  // Confirm user block/unblock
  const confirmBlockToggle = async () => {
    if (!userToBlock) return;

    const success = await toggleUserBlockStatus(
      userToBlock.id,
      !!userToBlock.isBlocked
    );

    if (success) {
      toast.success(
        userToBlock.isBlocked
          ? `User ${userToBlock.email} has been unblocked.`
          : `User ${userToBlock.email} has been blocked.`
      );
      setUserToBlock(null);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Management
          </h1>
          <p className="text-gray-500">
            Manage user accounts, roles, and permissions.
          </p>
        </div>

        {/* Users Table Component */}
        <UsersTable
          users={users}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          isLoading={isLoading}
          onEditUser={handleEditUser}
          onBlockUser={handleBlockUser}
          formatDate={formatDate}
        />

        {/* User Edit Modal */}
        <UserEditModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveUserChanges}
          onChange={setEditingUser}
          currentUserRole={currentUserRole}
        />

        {/* Block/Unblock Confirmation Dialog */}
        <ConfirmDialog
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onConfirm={confirmBlockToggle}
          title={userToBlock?.isBlocked ? "Unblock User" : "Block User"}
          description={
            userToBlock?.isBlocked
              ? `Are you sure you want to unblock ${userToBlock?.email}? This will allow them to sign in and use the application.`
              : `Are you sure you want to block ${userToBlock?.email}? This will prevent them from signing in and using the application.`
          }
          confirmText={userToBlock?.isBlocked ? "Unblock" : "Block"}
          cancelText="Cancel"
          icon={
            userToBlock?.isBlocked ? (
              <ShieldAlert className="h-6 w-6" />
            ) : (
              <UserX className="h-6 w-6" />
            )
          }
          variant={userToBlock?.isBlocked ? "info" : "danger"}
        />
      </div>
    </AdminDashboardLayout>
  );
};

export default UsersDashboard;
