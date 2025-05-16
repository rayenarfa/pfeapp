import { useEffect, useState, useRef } from "react";
import { db } from "../../config/firebase/firebaseConfig";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import AdminDashboardLayout from "../../components/layout/AdminDashboardLayout";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  RefreshCw,
  ShoppingCart,
  User,
  Calendar,
  Mail,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import {
  Order,
  getAllOrders,
  getUserOrdersById,
  updateOrderStatus,
} from "../../utils/orderUtils";
import { format } from "date-fns";
import { sendInvoiceEmail } from "../../utils/emailService";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "" | "completed" | "pending" | "failed"
  >("");
  const [dateFilter, setDateFilter] = useState<
    "today" | "week" | "month" | "all"
  >("all");
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
    null
  );
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [users, setUsers] = useState<
    { id: string; email: string; displayName?: string }[]
  >([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check URL params for userId filter
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");

    if (userId) {
      setUserIdFilter(userId);
      fetchUserOrders(userId);
    } else {
      fetchOrders();
    }

    fetchUsers();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [location.search]);

  useEffect(() => {
    // Calculate stats whenever orders change
    if (orders.length > 0) {
      const stats = orders.reduce(
        (acc, order) => {
          acc.total += order.total;
          if (order.status === "completed") acc.completed++;
          if (order.status === "pending") acc.pending++;
          if (order.status === "failed") acc.failed++;
          return acc;
        },
        { total: 0, completed: 0, pending: 0, failed: 0 }
      );
      setTotalStats(stats);
    }
  }, [orders]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error: unknown) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email,
        displayName: doc.data().displayName || doc.data().name,
      }));
      setUsers(usersList);
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
    }
  };

  const handleOrderStatusChange = async (
    orderId: string,
    status: "pending" | "completed" | "failed"
  ) => {
    setIsStatusUpdating(orderId);
    setStatusUpdateError(null);

    try {
      const success = await updateOrderStatus(orderId, status);

      if (success) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      } else {
        setStatusUpdateError("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      setStatusUpdateError("An error occurred. Please try again.");
    } finally {
      setIsStatusUpdating(null);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    if (!userId) return;

    setIsLoading(true);
    setUserIdFilter(userId);

    try {
      const userOrders = await getUserOrdersById(userId);
      setOrders(userOrders);
    } catch (error) {
      console.error(`Error fetching orders for user ${userId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setUserIdFilter("");
    setSelectedStatus("");
    setDateFilter("all");
    setSearchQuery("");
    setUserSearchQuery("");
    navigate("/admin/orders");
    fetchOrders();
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handleSendInvoiceEmail = async (order: Order) => {
    try {
      setSendingInvoiceId(order.id);
      const result = await sendInvoiceEmail(order);
      if (result.success) {
        toast.success(`Invoice sent to ${order.customerEmail}`);
      } else {
        toast.error(`Failed to send invoice: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      toast.error('Failed to send invoice email');
    } finally {
      setSendingInvoiceId(null);
    }
  };

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return "No date";
    try {
      const date = timestamp.toDate();
      return format(date, "MMM d, yyyy h:mm a");
    } catch (
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      _error: unknown
    ) {
      return "Invalid date";
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const displayName = user.displayName || "";
    const email = user.email || "";

    return (
      displayName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      email.toLowerCase().includes(userSearchQuery.toLowerCase())
    );
  });

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" || // If empty search, show all
      (order.orderNumber &&
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.customerEmail &&
        order.customerEmail
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.shippingAddress?.firstName &&
        order.shippingAddress.firstName
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (order.shippingAddress?.lastName &&
        order.shippingAddress.lastName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));

    const matchesStatus =
      selectedStatus === "" || order.status === selectedStatus;

    let matchesDate = true;
    if (dateFilter !== "all" && order.date) {
      const orderDate = order.date.toDate();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        matchesDate = orderDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        matchesDate = orderDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        matchesDate = orderDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getUserDisplayName = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.displayName || user.email : userId;
  };

  const getStatusBadgeClass = (
    status: "completed" | "pending" | "failed" | string
  ) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSelectUser = (userId: string) => {
    setShowUserDropdown(false);
    if (userId !== userIdFilter) {
      if (userId) {
        fetchUserOrders(userId);
        navigate(`/admin/orders?userId=${userId}`);
      } else {
        clearFilters();
      }
    }
  };

  // Get display name of currently filtered user
  const currentUserName = userIdFilter
    ? getUserDisplayName(userIdFilter)
    : "All Users";

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ShoppingCart className="h-6 w-6 mr-2 text-indigo-600" />
              Order Management
            </h1>
            {userIdFilter && (
              <p className="mt-1 text-sm text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-1" />
                Viewing orders for:{" "}
                <span className="font-medium ml-1">{currentUserName}</span>
                <button
                  onClick={clearFilters}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  (Clear)
                </button>
              </p>
            )}
            {!userIdFilter && (
              <p className="mt-1 text-sm text-gray-500">
                View and manage all customer orders
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <button
              onClick={fetchOrders}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-semibold">{orders.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold">{totalStats.completed}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold">{totalStats.pending}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <X className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold">{totalStats.failed}</p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex space-x-2">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as "" | "completed" | "pending" | "failed"
                    )
                  }
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value as "today" | "week" | "month" | "all"
                    )
                  }
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* User filter with searchable dropdown */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center justify-between w-56 pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="truncate">{currentUserName}</span>
                  </div>
                  <ChevronDown size={16} className="text-gray-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute mt-1 z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
                      <input
                        autoFocus
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => handleSelectUser("")}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          !userIdFilter ? "bg-indigo-50 text-indigo-600" : ""
                        }`}
                      >
                        All Users
                      </button>

                      {filteredUsers.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No users found
                        </div>
                      ) : (
                        filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleSelectUser(user.id)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                              userIdFilter === user.id
                                ? "bg-indigo-50 text-indigo-600"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {user.displayName || "Unnamed User"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {user.email}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {(searchQuery ||
                selectedStatus !== "" ||
                dateFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Order header */}
                <div
                  className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleOrderExpand(order.id)}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-col sm:flex-row sm:space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(order.date)}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {getUserDisplayName(order.userId)}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {order.customerEmail}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-indigo-600 text-lg font-semibold mr-3">
                      TND {order.total.toFixed(2)}
                    </span>
                    <svg
                      className={`w-5 h-5 ml-3 text-gray-500 transform transition-transform ${
                        expandedOrder === order.id ? "rotate-180" : ""
                      }`}
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
                  </div>
                </div>

                {/* Order details when expanded */}
                <AnimatePresence>
                  {expandedOrder === order.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="p-4 sm:p-6 border-b border-gray-200">
                        <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <h4 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0">
                            Order Items
                          </h4>

                          <div className="flex items-center space-x-2">
                            {isStatusUpdating === order.id ? (
                              <div className="text-sm text-gray-500 flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-indigo-600 mr-2"></div>
                                Updating...
                              </div>
                            ) : (
                              <>
                                <span className="text-sm text-gray-500">
                                  Update Status:
                                </span>
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleOrderStatusChange(
                                      order.id,
                                      e.target.value as
                                        | "pending"
                                        | "completed"
                                        | "failed"
                                    )
                                  }
                                  className="ml-2 block w-full pl-3 pr-10 py-1 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                  <option value="completed">Completed</option>
                                  <option value="pending">Pending</option>
                                  <option value="failed">Failed</option>
                                </select>
                              </>
                            )}
                          </div>
                        </div>

                        {statusUpdateError && (
                          <div className="mb-4 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-600">
                            {statusUpdateError}
                          </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 mt-4">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4"
                            >
                              <div className="flex items-start">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover object-center"
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex justify-between">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {item.name}
                                      </h4>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {item.brand} - {item.category}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                      TND {item.price.toFixed(2)} x{" "}
                                      {item.quantity}
                                    </p>
                                  </div>

                                  <div className="mt-2">
                                    <div className="bg-indigo-50 rounded-md p-2">
                                      <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-medium text-indigo-700">
                                          Gift Card Key:
                                        </span>
                                      </div>
                                      <p className="font-mono text-sm text-indigo-800 select-all">
                                        {item.giftCardKey}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="px-4 py-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">
                            Shipping Details
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-gray-800 font-medium">
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress.address}
                            </p>
                            <p className="text-gray-600">
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {order.shippingAddress.email}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">
                            Payment Details
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <div className="flex items-center">
                              <svg
                                className="h-6 w-10 mr-2"
                                viewBox="0 0 40 24"
                                fill="none"
                              >
                                <rect
                                  width="40"
                                  height="24"
                                  rx="4"
                                  fill="#E6E6E6"
                                />
                                <path d="M13 15H26V18H13V15Z" fill="#666666" />
                              </svg>
                              <div>
                                <p className="text-gray-800 font-medium">
                                  {order.paymentMethod.cardType}
                                </p>
                                <p className="text-gray-600">
                                  ending in {order.paymentMethod.lastFour}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                  TND {order.total.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-medium">
                                  Free
                                </span>
                              </div>
                              <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                                <span className="font-medium text-gray-800">
                                  Total
                                </span>
                                <span className="font-bold text-indigo-600">
                                  TND {order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="px-4 py-3 bg-gray-50 flex justify-end space-x-3 border-t border-gray-200">
                        <button
                          onClick={() =>
                            navigate(`/admin/users?userId=${order.userId}`)
                          }
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <User className="h-4 w-4 mr-2" />
                          View Customer
                        </button>
                        <button
                          onClick={() =>
                            window.open(
                              `mailto:${order.customerEmail}?subject=Your order ${order.orderNumber}`,
                              "_blank"
                            )
                          }
                          className="inline-flex items-center px-3 py-2 border border-indigo-500 shadow-sm text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Customer
                        </button>
                        <button
                          onClick={async () => {
                            const { getInvoiceDataUrl, getInvoiceFilename } = await import('../../utils/invoiceUtils');
                            const dataUrl = await getInvoiceDataUrl(order);
                            const link = document.createElement('a');
                            link.href = dataUrl;
                            link.download = getInvoiceFilename(order);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="inline-flex items-center px-3 py-2 border border-green-500 shadow-sm text-sm leading-4 font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                          Download Invoice
                        </button>
                        <button
                          onClick={() => handleSendInvoiceEmail(order)}
                          disabled={sendingInvoiceId === order.id}
                          className="inline-flex items-center px-3 py-2 border border-blue-500 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-70"
                        >
                          {sendingInvoiceId === order.id ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Sending...
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email Invoice
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow py-8 px-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No orders found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ||
              selectedStatus ||
              dateFilter !== "all" ||
              userIdFilter
                ? "Try adjusting your filters"
                : "No orders have been placed yet"}
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-indigo-600 text-sm font-medium rounded-md text-indigo-600 bg-transparent hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminOrders;
