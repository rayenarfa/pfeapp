import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";
import { motion } from "framer-motion";
import { getOrderById } from "../../utils/orderUtils";
import { Order, OrderItem } from "../../types/OrderTypes";
import { Timestamp } from "firebase/firestore";
import { getInvoiceDataUrl } from "../../utils/invoiceUtils";
import { sendInvoiceEmail } from "../../utils/emailService";
import { toast } from "sonner";

const OrderConfirmationPage: React.FC = () => {
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isSendingInvoice, setIsSendingInvoice] = useState(false);

  const location = useLocation();
  const orderId = new URLSearchParams(location.search).get("orderId");

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found. Please check your order history.");
      setIsLoading(false);
      return;
    }

    // Fetch order details
    getOrderById(orderId)
      .then((orderData) => {
        if (orderData) {
          setOrder(orderData);
          // Clear the cart as the order is now completed
          clearCart();
        } else {
          setError("Order not found. Please check your order history.");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
        setError("Failed to load order details. Please try again later.");
        setIsLoading(false);
      });
  }, [orderId, clearCart]);

  // Format date from Firestore Timestamp
  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Handle invoice download
  const handleDownloadInvoice = async () => {
    if (!order) return;
    
    try {
      setIsDownloadingInvoice(true);
      const dataUrl = await getInvoiceDataUrl(order);
      
      // Create an anchor element and trigger download
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
      setIsDownloadingInvoice(false);
    }
  };
  
  // Handle sending invoice via email
  const handleSendInvoiceEmail = async () => {
    if (!order) return;
    
    try {
      setIsSendingInvoice(true);
      const result = await sendInvoiceEmail(order);
      if (result.success) {
        toast.success('Invoice sent to your email!');
      } else {
        toast.error(result.message || 'Failed to send invoice. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send invoice. Please try again.');
    } finally {
      setIsSendingInvoice(false);
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
            className="max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              {/* Success header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8 text-center">
                <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">
                  Order Confirmed!
                </h1>
                <p className="text-indigo-100 mt-2">
                  Thank you for your purchase
                </p>
              </div>

              {/* Order details */}
              <div className="p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
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
                  <div className="py-8 text-center">
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
                        to="/orders"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        View Order History
                      </Link>
                    </div>
                  </div>
                ) : (
                  order && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                          Order Details
                        </h2>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Order number</p>
                              <p className="font-medium text-gray-900">
                                {order.orderNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Date placed</p>
                              <p className="font-medium text-gray-900">
                                {formatDate(order.date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total amount</p>
                              <p className="font-medium text-gray-900">
                                TND {order.total.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Items</p>
                              <p className="font-medium text-gray-900">
                                {order.items.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Shipping Information
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-sm font-medium text-gray-800">
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.city},{" "}
                              {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-md">
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
                                <p className="text-sm font-medium text-gray-800">
                                  {order.paymentMethod.cardType}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ending in {order.paymentMethod.lastFour}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Gift Card Keys Section */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700">
                            Your Gift Card Keys
                          </h3>
                          <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center">
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
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            Sent to your email
                          </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border border-indigo-100">
                          <p className="text-xs text-gray-500 mb-3">
                            Please save these keys in a safe place. You'll need
                            them to redeem your gift cards.
                          </p>
                          <div className="space-y-3">
                            {order.items.map(
                              (item: OrderItem, index: number) => (
                                <div
                                  key={index}
                                  className="bg-white p-3 rounded-md border border-gray-200 shadow-sm"
                                >
                                  <div className="flex items-center mb-2">
                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-3">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {item.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {item.brand} ({item.quantity}x)
                                      </p>
                                    </div>
                                  </div>
                                  <div className="bg-indigo-50 p-2 rounded text-center">
                                    <p className="font-mono font-medium text-indigo-700 tracking-wider select-all">
                                      {item.giftCardKey}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-3">
                        <p className="text-sm text-gray-500 text-center">
                          A confirmation email with your gift card keys has been
                          sent to{" "}
                          <span className="font-medium">
                            {order.customerEmail}
                          </span>
                          .
                        </p>
                        <p className="text-sm text-gray-500 text-center">
                          If you have any questions about your order, please
                          contact our customer support.
                        </p>

                        {/* Invoice Section */}
                        <div className="mt-6 mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-medium text-gray-700">Invoice</h3>
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
                          <div className="bg-gray-50 p-4 rounded-md border border-green-100">
                            <p className="text-xs text-gray-500 mb-3">
                              You can download your invoice or have it sent to your email address.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                              <button
                                onClick={handleDownloadInvoice}
                                disabled={isDownloadingInvoice}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                              >
                                {isDownloadingInvoice ? (
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
                                onClick={handleSendInvoiceEmail}
                                disabled={isSendingInvoice}
                                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
                              >
                                {isSendingInvoice ? (
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

                        <div className="flex justify-center mt-6 space-x-4">
                          <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                          >
                            Continue Shopping
                          </Link>
                          <Link
                            to="/orders"
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Order History
                          </Link>
                        </div>
                      </div>
                    </>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center sm:flex sm:justify-between sm:text-left">
            <motion.p whileHover={{ x: 2 }} className="text-sm text-gray-500">
              &copy; 2025 SharePay. All rights reserved.
            </motion.p>
            <div className="flex justify-center sm:justify-end space-x-6 mt-3 sm:mt-0">
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Privacy Policy</span>
                <span className="text-sm">Privacy Policy</span>
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Terms of Service</span>
                <span className="text-sm">Terms of Service</span>
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                href="#"
                className="text-gray-400 hover:text-indigo-600 transition-colors duration-200"
              >
                <span className="sr-only">Contact Us</span>
                <span className="text-sm">Contact Us</span>
              </motion.a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrderConfirmationPage;
