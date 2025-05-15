import { useEffect, useState } from "react";
import { db } from "../../config/firebase/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  PlusCircle,
  Edit,
  ShoppingCart,
  AlertTriangle,
  User,
  ChevronRight,
} from "lucide-react";
import { ReactElement } from "react";
import { Order } from "../../utils/orderUtils";
import { format } from "date-fns";

// Define types for component props
interface StatCardProps {
  icon: ReactElement;
  title: string;
  value: string | number;
  color: string;
  link?: string;
  linkText?: string;
}

interface QuickActionLinkProps {
  to: string;
  icon: ReactElement;
  title: string;
  description: string;
  color: string;
}

interface ActivityItemProps {
  icon: ReactElement;
  color: string;
  title: string;
  highlight: string;
  time: string;
  onClick?: () => void;
}

interface StatsState {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  recentOrders: Order[];
  recentUsers: {
    id: string;
    email: string;
    displayName?: string;
    createdAt?: Date;
  }[];
  loading: boolean;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<StatsState>({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    recentOrders: [],
    recentUsers: [],
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get collections data in parallel
        const [
          productsSnapshot,
          usersSnapshot,
          ordersSnapshot,
          pendingOrdersSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "users")),
          getDocs(
            query(collection(db, "orders"), orderBy("date", "desc"), limit(5))
          ),
          getDocs(
            query(collection(db, "orders"), where("status", "==", "pending"))
          ),
        ]);

        // Get total counts
        const totalProducts = productsSnapshot.size;
        const totalUsers = usersSnapshot.size;
        const totalOrders = (await getDocs(collection(db, "orders"))).size;
        const pendingOrders = pendingOrdersSnapshot.size;

        // Get recent orders for the activity feed
        const recentOrders = ordersSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            orderNumber: data.orderNumber,
            date: data.date,
            total: data.total,
            status: data.status,
            customerEmail: data.customerEmail,
            userId: data.userId,
            items: data.items,
          } as Order;
        });

        // Get recent users for the activity feed
        const recentUsers = usersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            email: doc.data().email,
            displayName: doc.data().displayName || doc.data().name,
            createdAt: doc.data().createdAt?.toDate
              ? doc.data().createdAt.toDate()
              : doc.data().createdAt,
          }))
          .sort((a, b) => {
            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;
            return b.createdAt.getTime() - a.createdAt.getTime();
          })
          .slice(0, 5);

        setStats({
          totalProducts,
          totalUsers,
          totalOrders,
          pendingOrders,
          recentOrders,
          recentUsers,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  // Format date helper
  const formatDate = (timestamp: Timestamp | Date | null | undefined) => {
    if (!timestamp) return "—";
    try {
      // Handle both Firestore Timestamp and regular Date objects
      const date =
        "toDate" in timestamp ? timestamp.toDate() : new Date(timestamp);
      return format(date, "MMM d, yyyy h:mm a");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return "Invalid date";
    }
  };

  // Time ago helper
  const getTimeAgo = (date: Date | undefined) => {
    if (!date) return "—";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
    }
    if (diffHour > 0) {
      return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
    }
    if (diffMin > 0) {
      return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
    }
    return "Just now";
  };

  // Reusable components with TypeScript interfaces
  const StatCard = ({
    icon,
    title,
    value,
    color,
    link,
    linkText,
  }: StatCardProps) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`bg-${color}-100 p-3 rounded-lg`}>{icon}</div>
          <div className="ml-4">
            <h2 className="text-sm font-medium text-gray-500">{title}</h2>
            {stats.loading ? (
              <div className="h-7 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            )}
          </div>
        </div>
        {link && linkText && (
          <Link
            to={link}
            className={`mt-4 text-${color}-600 hover:text-${color}-800 text-sm font-medium flex items-center`}
          >
            <span>{linkText}</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        )}
      </div>
    </div>
  );

  const QuickActionLink = ({
    to,
    icon,
    title,
    description,
    color,
  }: QuickActionLinkProps) => (
    <Link
      to={to}
      className={`flex items-center p-3 bg-${color}-50 hover:bg-${color}-100 rounded-lg transition-colors`}
    >
      <div className={`bg-${color}-100 p-2 rounded`}>{icon}</div>
      <div className="ml-3">
        <span className="font-medium text-gray-800">{title}</span>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );

  const ActivityItem = ({
    icon,
    color,
    title,
    highlight,
    time,
    onClick,
  }: ActivityItemProps) => (
    <li
      className={`py-3 ${onClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`bg-${color}-100 p-2 rounded-full`}>{icon}</div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">
            {title} <span className="text-indigo-600">{highlight}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </li>
  );

  return (
    <AdminDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome to your admin control panel
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/admin/products"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <PlusCircle size={18} className="mr-2" />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <StatCard
            icon={<Package size={24} className="text-indigo-600" />}
            title="Total Products"
            value={stats.totalProducts}
            color="indigo"
            link="/admin/products"
            linkText="View all products"
          />

          <StatCard
            icon={<Users size={24} className="text-purple-600" />}
            title="Total Users"
            value={stats.totalUsers}
            color="purple"
            link="/admin/users"
            linkText="View all users"
          />

          <StatCard
            icon={<ShoppingCart size={24} className="text-green-600" />}
            title="Total Orders"
            value={stats.totalOrders}
            color="green"
            link="/admin/orders"
            linkText="View all orders"
          />

          <StatCard
            icon={<AlertTriangle size={24} className="text-amber-600" />}
            title="Pending Orders"
            value={stats.pendingOrders}
            color="amber"
            link="/admin/orders"
            linkText="View pending orders"
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Quick Actions</h2>
            </div>

            <div className="space-y-3">
              <QuickActionLink
                to="/admin/products"
                icon={<PlusCircle size={18} className="text-indigo-600" />}
                title="Add New Product"
                description="Create and publish a new product"
                color="indigo"
              />

              <QuickActionLink
                to="/admin/products"
                icon={<Edit size={18} className="text-green-600" />}
                title="Manage Products"
                description="Edit, update or remove products"
                color="green"
              />

              <QuickActionLink
                to="/admin/orders"
                icon={<ShoppingCart size={18} className="text-amber-600" />}
                title="Manage Orders"
                description="View and manage customer orders"
                color="amber"
              />

              <QuickActionLink
                to="/admin/users"
                icon={<Users size={18} className="text-purple-600" />}
                title="Manage Users"
                description="Update user roles and permissions"
                color="purple"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Recent Activity
              </h2>
              <Link
                to="/admin/orders"
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>

            <div className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {stats.loading ? (
                  Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-center">
                          <div className="bg-gray-200 h-10 w-10 rounded-full animate-pulse"></div>
                          <div className="ml-3">
                            <div className="bg-gray-200 h-4 w-40 rounded animate-pulse"></div>
                            <div className="bg-gray-200 h-3 w-24 mt-2 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </li>
                    ))
                ) : (
                  <>
                    {stats.recentOrders.map((order) => (
                      <ActivityItem
                        key={order.id}
                        icon={
                          <ShoppingCart size={16} className="text-green-600" />
                        }
                        color="green"
                        title="New order:"
                        highlight={`#${order.orderNumber}`}
                        time={formatDate(order.date)}
                        onClick={() =>
                          (window.location.href = `/admin/orders?orderId=${order.id}`)
                        }
                      />
                    ))}

                    {stats.recentUsers.map((user) => (
                      <ActivityItem
                        key={user.id}
                        icon={<User size={16} className="text-purple-600" />}
                        color="purple"
                        title="New user registered:"
                        highlight={user.displayName || user.email}
                        time={user.createdAt ? getTimeAgo(user.createdAt) : "—"}
                        onClick={() =>
                          (window.location.href = `/admin/users?userId=${user.id}`)
                        }
                      />
                    ))}
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
