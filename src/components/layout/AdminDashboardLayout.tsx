import React, { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../../config/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  Menu,
  X,
  Package,
  Users,
  LogOut,
  ExternalLink,
  ShoppingBag,
  BarChart2,
  User,
  ShoppingCart,
  ChevronRight,
} from "lucide-react";

interface AdminDashboardLayoutProps {
  children: ReactNode;
}

const AdminDashboardLayout: React.FC<AdminDashboardLayoutProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role?: string;
  } | null>(null);

  // Handle resize and close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Get current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user data from Firestore to get the role
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({
              name: firebaseUser.displayName || userData.name || "Admin",
              email: firebaseUser.email || "",
              role: userData.role || "client",
            });
          } else {
            setCurrentUser({
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setCurrentUser({
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
          });
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get the current page title based on path
  const getPageTitle = () => {
    if (location.pathname === "/admin/products") return "Products Management";
    if (location.pathname === "/admin/users") return "Users Management";
    if (location.pathname === "/admin/orders") return "Orders Management";
    return "Dashboard Overview";
  };

  // Navigation items for reuse - filtered based on user role
  const getNavItems = () => {
    const baseItems = [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <BarChart2 size={20} />,
        match: ["/admin", "/admin/dashboard"],
      },
      {
        name: "Products",
        path: "/admin/products",
        icon: <Package size={20} />,
        match: ["/admin/products"],
      },
      {
        name: "Orders",
        path: "/admin/orders",
        icon: <ShoppingCart size={20} />,
        match: ["/admin/orders"],
      },
    ];

    // Add Users management for both admins and superAdmin
    if (currentUser?.role === "superAdmin" || currentUser?.role === "admin") {
      baseItems.push({
        name: "Users",
        path: "/admin/users",
        icon: <Users size={20} />,
        match: ["/admin/users"],
      });
    }

    return baseItems;
  };

  const isActive = (item: ReturnType<typeof getNavItems>[0]) => {
    return item.match.some(
      (path) =>
        location.pathname === path ||
        (path.endsWith("/*") && location.pathname.startsWith(path.slice(0, -2)))
    );
  };

  const navItems = getNavItems();

  return (
    <div className="flex flex-col h-screen bg-gray-50 lg:flex-row">
      {/* Mobile Header - Improved with new styling */}
      <header
        className={`lg:hidden bg-white text-gray-800 px-4 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-40 
        ${scrolled ? "shadow-lg" : "border-b border-gray-200"} 
        transition-all duration-300`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
            aria-label="Toggle navigation"
          >
            <Menu size={22} className="text-indigo-600" />
          </button>
          <Link to="/" className="text-lg font-bold flex items-center gap-2">
            <ShoppingBag size={22} className="text-indigo-600" />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text font-extrabold">
              SharePay
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="p-1 rounded-full bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
            aria-label="User menu"
          >
            <User size={20} className="text-indigo-700 m-1" />
          </button>
        </div>
      </header>

      {/* Sidebar - Completely restyled */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] max-w-full transform transition-all duration-500 ease-in-out lg:relative lg:translate-x-0 lg:shadow-none
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${scrolled ? "lg:shadow-md" : ""}`}
      >
        {/* Backdrop for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={toggleSidebar}
            aria-hidden="true"
          ></div>
        )}

        {/* Sidebar content - completely redesigned */}
        <div className="relative h-full z-50 bg-white text-gray-800 flex flex-col shadow-xl overflow-hidden border-r border-gray-200">
          {/* Close button - mobile only */}
          <button
            onClick={toggleSidebar}
            className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors lg:hidden focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>

          {/* Logo area */}
          <div className="p-6 flex items-center justify-center lg:justify-start">
            <Link
              to="/admin/dashboard"
              className="text-xl font-bold flex items-center gap-2.5"
            >
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-extrabold text-xl">
                SharePay
              </span>
            </Link>
          </div>

          {/* Navigation Menu - Completely redesigned */}
          <nav className="flex-1 pt-2 pb-4 px-4 overflow-y-auto">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                Management
              </p>
              <ul className="space-y-1.5">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 
                        ${
                          isActive(item)
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-medium shadow-sm"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <span
                        className={`p-1.5 rounded-lg mr-3 flex-shrink-0 
                        ${
                          isActive(item)
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1">{item.name}</span>
                      {isActive(item) && (
                        <ChevronRight
                          size={16}
                          className="text-indigo-500 animate-pulse"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Bottom actions section */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <Link
              to="/"
              className="flex items-center text-gray-700 hover:text-indigo-600 p-3 rounded-xl transition-colors hover:bg-gray-100 group"
            >
              <ExternalLink
                size={18}
                className="mr-3 text-gray-500 group-hover:text-indigo-500 transition-colors"
              />
              <span>Visit Store</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white shadow-sm"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-14">
        {/* Top Navigation - Desktop only - Improved styling */}
        <header
          className={`hidden lg:flex bg-white h-16 items-center justify-between px-6 sticky top-0 z-10 
            ${scrolled ? "shadow-md" : "border-b border-gray-200"} 
            transition-all duration-300`}
        >
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <ExternalLink size={16} className="mr-1" />
              <span>Store</span>
            </Link>

            <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                <User size={18} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">
                  {currentUser?.name || "Admin"}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {/* Mobile page title bar */}
          <div className="lg:hidden mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
          </div>

          {/* Content wrapper with improved spacing and transition */}
          <div className="transition-all duration-300 ease-in-out">
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-auto pt-6 pb-4">
            <div className="text-center text-sm text-gray-500">
              <p>
                © {new Date().getFullYear()} SharePay Admin. All rights
                reserved.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
