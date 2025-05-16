import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Order, getUserOrders } from "../../utils/orderUtils";
import { Timestamp } from "firebase/firestore";
import { auth } from "../../config/firebase/firebaseConfig";
import Footer from "../../components/layout/Footer";
import { getInvoiceDataUrl } from "../../utils/invoiceUtils";
import { sendInvoiceEmail } from "../../utils/emailService";
import { toast } from "sonner";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [, setExpandedGiftCard] = useState<{
    orderId: string;
    itemId: string;
  } | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Add debug logging for authentication status
        console.log("Current user:", auth.currentUser?.uid);
        console.log("Is user logged in:", !!auth.currentUser);

        const userOrders = await getUserOrders();
        console.log("Orders fetched:", userOrders.length); // Log the number of orders fetched
        setOrders(userOrders);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please try again later.");
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      setExpandedGiftCard(null); // Close any open gift card when toggling orders
    }
  };

  // Handle invoice download for a specific order
  const handleDownloadInvoice = async (order: Order) => {
    try {
      setDownloadingInvoiceId(order.id);
      const dataUrl = await getInvoiceDataUrl(order);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Invoice_${order.orderNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Failed to generate invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // Handle sending invoice via email for a specific order
  const handleSendInvoiceEmail = async (order: Order) => {
    try {
      setSendingInvoiceId(order.id);
      const result = await sendInvoiceEmail(order);
      if (result.success) {
        toast.success('Invoice sent to your email');
      } else {
        toast.error(`Failed to send invoice: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to send invoice email:', error);
      toast.error('Failed to send invoice to your email');
    } finally {
      setSendingInvoiceId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 flex-grow">
        <main className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4 sm:mb-8 text-center bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Your Order History
            </motion.h1>

            {isLoading ? (
              <div className="bg-white rounded-xl shadow-md p-8 flex justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-600"
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
              </div>
            ) : error ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-800 font-medium">{error}</p>
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Go to Homepage
                  </Link>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2">
                  No orders yet
                </h2>
                <p className="text-gray-500 mb-6">
                  You haven't placed any orders yet.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Order Header */}
                    <div
                      className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200 cursor-pointer flex justify-between items-center"
                      onClick={() => toggleOrderExpand(order.id)}
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Placed on {formatDate(order.date)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                          {order.status}
                        </span>
                        <span className="text-indigo-600 text-lg font-semibold">
                          TND {formatCurrency(order.total)}
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

                    {/* Order Details */}
                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">
                              Gift Cards
                            </h4>
                            <div className="grid grid-cols-1 gap-4 mt-4">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
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
                                          TND{" "}
                                          {item.price % 1 === 0
                                            ? item.price.toFixed(0)
                                            : item.price.toFixed(2)}{" "}
                                          x {item.quantity}
                                        </p>
                                      </div>

                                      <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                        <div className="flex-1">
                                          <div className="bg-indigo-50 rounded-md p-2 mt-2 sm:mt-0">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="text-xs font-medium text-indigo-700">
                                                Gift Card Key:
                                              </span>
                                              <span className="text-xs text-indigo-500 bg-white px-2 py-0.5 rounded-full">
                                                Copy to use
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
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Invoice Section */}
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-700">Invoice</h4>
                              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center">
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Available for download
                              </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-md border border-green-100 mb-4">
                              <p className="text-xs text-gray-500 mb-3">
                                You can download your invoice or have it sent to your email address.
                              </p>
                              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                                <button
                                  onClick={() => handleDownloadInvoice(order)}
                                  disabled={downloadingInvoiceId === order.id}
                                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                                >
                                  {downloadingInvoiceId === order.id ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                      </svg>
                                      Download Invoice
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleSendInvoiceEmail(order)}
                                  disabled={sendingInvoiceId === order.id}
                                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                                >
                                  {sendingInvoiceId === order.id ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                      Email Invoice
                                    </>
                                  )}
                                </button>
                              </div>
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
                                    <path
                                      d="M13 15H26V18H13V15Z"
                                      fill="#666666"
                                    />
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
                                    <span className="text-gray-600">
                                      Subtotal
                                    </span>
                                    <span className="font-medium">
                                      TND {formatCurrency(order.total)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between mt-1">
                                    <span className="text-gray-600">
                                      Shipping
                                    </span>
                                    <span className="text-green-600 font-medium">
                                      Free
                                    </span>
                                  </div>
                                  <div className="flex justify-between mt-2 pt-2 border-t border-gray-200">
                                    <span className="font-medium text-gray-800">
                                      Total
                                    </span>
                                    <span className="font-bold text-indigo-600">
                                      TND {formatCurrency(order.total)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Orders;
