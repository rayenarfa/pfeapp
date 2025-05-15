import React, { useEffect, useState } from "react";
import { auth, db } from "../../config/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Save, X } from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import { toast } from "sonner";


interface UserData {
  email: string;
  role: string;
  name: string;
  phoneNumber: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
  lastLogin?: string;
}

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editableData, setEditableData] = useState<{
    name: string;
    email: string;
    phoneNumber: string;
  }>({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("profile");

  useEffect(() => {
    const fetchUserData = async (user: FirebaseUser) => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();

          // Format timestamp data if it exists
          let createdAt = "January 15, 2025";
          if (data.createdAt && data.createdAt instanceof Timestamp) {
            createdAt = formatDate(data.createdAt.toDate());
          }

          let lastLogin = "March 10, 2025";
          if (data.lastLogin && data.lastLogin instanceof Timestamp) {
            lastLogin = formatDate(data.lastLogin.toDate());
          }

          const userData = {
            ...(data as UserData),
            displayName: user.displayName || data.name || "User",
            photoURL: user.photoURL || undefined,
            createdAt,
            lastLogin,
          };

          setUserData(userData);
          setEditableData({
            name: userData.name || userData.displayName || "",
            email: userData.email || user.email || "",
            phoneNumber: userData.phoneNumber || "",
          });
        } else {
          console.error("User data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user as FirebaseUser);
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to original values
    if (userData) {
      setEditableData({
        name: userData.name || userData.displayName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
      });
    }
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!userData) return;

    setUpdateLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No authenticated user found");
      }

      const userDocRef = doc(db, "users", user.uid);

      // Update Firestore document
      await updateDoc(userDocRef, {
        name: editableData.name,
        phoneNumber: editableData.phoneNumber,
      });

      // Update email if changed
      if (editableData.email !== userData.email) {
        await updateEmail(user, editableData.email);
        await updateDoc(userDocRef, {
          email: editableData.email,
        });
      }

      // Refresh user data
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        const data = updatedDoc.data();
        setUserData({
          ...(userData as UserData),
          ...(data as Partial<UserData>),
        });
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes("requires-recent-login")) {
          toast.error("Please sign in again before changing your email");
        } else {
          toast.error(`Error updating profile: ${error.message}`);
        }
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  const tabs = [{ id: "profile", label: "Profile", icon: <User size={18} /> }];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      {/* Add padding-top to ensure content doesn't hide under navbar */}
      <div className="container mx-auto px-4 py-6 pt-20 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative mb-4 md:mb-0 md:mr-6"
              >
                {userData?.photoURL ? (
                  <img
                    src={userData.photoURL}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold">
                    {editableData.name?.[0] || "U"}
                  </div>
                )}
              </motion.div>

              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold">
                  {isEditing
                    ? editableData.name
                    : userData?.name || userData?.displayName || "Welcome"}
                </h1>
                <p className="text-blue-100 mt-1 flex items-center justify-center md:justify-start text-sm">
                  <Mail size={14} className="mr-2" />
                  {isEditing ? editableData.email : userData?.email}
                </p>
                {userData?.role && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-800 text-blue-100">
                      {userData.role}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center px-4 py-3 text-sm font-medium flex-1 justify-center ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {activeTab === "profile" && (
              <div className="space-y-6">
                {isEditing ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Display Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={editableData.name}
                          onChange={handleChange}
                          className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={editableData.email}
                          onChange={handleChange}
                          className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-600 block mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={editableData.phoneNumber}
                          onChange={handleChange}
                          className="w-full pl-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={updateLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        {updateLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2 animate-spin"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Saving...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </span>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCancelEdit}
                        disabled={updateLoading}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors flex items-center justify-center"
                      >
                        <X size={16} className="mr-2" />
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-500 mb-1">
                        Display Name
                      </div>
                      <div className="font-medium">
                        {userData?.name || userData?.displayName}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-500 mb-1">
                        Email Address
                      </div>
                      <div className="font-medium truncate">
                        {userData?.email}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-500 mb-1">
                        Phone Number
                      </div>
                      <div className="font-medium">
                        {userData?.phoneNumber || "Not provided"}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="text-sm text-gray-500 mb-1">
                        Account Created
                      </div>
                      <div className="font-medium flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        {userData?.createdAt}
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isEditing && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleEditProfile}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                    >
                      <User size={16} className="mr-2" />
                      Edit Profile
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
        
      </div>
      
    </div>
    
  );
  
};

export default Profile;
