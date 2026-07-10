import { useContext, useState } from "react";
import { OrderContext } from "../context/OrderContext";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaShoppingBag,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCreditCard,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./OrderDetails.css";

function OrderDetails() {
  const { orders } = useContext(OrderContext);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const toggleOrder = (orderNumber: number) => {
    setExpandedOrder((prev) => (prev === orderNumber ? null : orderNumber));
  };

  if (orders.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="empty-state">
          <span className="material-symbols-outlined empty-state-icon">
            receipt_long
          </span>
          <h2 className="empty-state-title">No Orders Yet</h2>
          <p className="empty-state-text">
            Your order history will appear here after you place your first
            order.
          </p>
          <a href="/" className="btn btn-primary btn-lg mt-4">
            Start Shopping
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper orders-page">
      <h1 className="page-title">
        📦 My Orders
      </h1>
      <p className="page-subtitle">
        You have {orders.length} order{orders.length !== 1 ? "s" : ""}
      </p>

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card glass-panel" key={order.orderNumber}>
            {/* ── Header ──────────────────────────────── */}
            <div
              className="order-card-header"
              onClick={() => toggleOrder(order.orderNumber)}
            >
              <div className="order-card-id">
                <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">
                  receipt
                </span>
                <span className="order-id-text">
                  Order #{order.orderNumber}
                </span>
                <span className="order-date">
                  <FaCalendarAlt className="inline mr-1" />
                  {order.orderDate}
                </span>
              </div>
              <div className="order-card-header-right">
                <span className="order-status-badge">
                  <FaCheckCircle className="inline mr-1" />
                  {order.status}
                </span>
                {expandedOrder === order.orderNumber ? (
                  <FaChevronUp size={16} />
                ) : (
                  <FaChevronDown size={16} />
                )}
              </div>
            </div>

            {/* ── Expandable Content ──────────────────── */}
            {expandedOrder === order.orderNumber && (
              <div className="order-expandable">
                {/* LEFT: Ordered Products */}
                <div className="order-products">
                  <h3 className="order-section-title">
                    <FaShoppingBag className="text-[var(--color-primary)]" />
                    Ordered Products
                  </h3>
                  <div className="order-products-list">
                    {order.items.map((item) => (
                      <div className="order-product-item" key={item.id}>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="order-item-img"
                        />
                        <div className="order-item-info">
                          <h4 className="order-item-name">{item.name}</h4>
                          <p className="order-item-qty">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="order-item-price">
                          ₹{item.price}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: Order Details */}
                <div className="order-details-panel">
                  <h3 className="order-section-title">Order Details</h3>
                  <div className="order-details-grid">
                    <div className="order-detail-row">
                      <FaUser className="text-blue-500" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="order-detail-row">
                      <FaPhone className="text-green-500" />
                      <span>{order.mobile}</span>
                    </div>
                    <div className="order-detail-row">
                      <FaMapMarkerAlt className="text-red-500" />
                      <span>{order.address}</span>
                    </div>
                    <div className="order-detail-row">
                      <FaCreditCard className="text-purple-500" />
                      <span>{order.paymentMode}</span>
                    </div>

                    <hr className="order-divider" />

                    <div className="order-cost-row">
                      <span>Grand Total</span>
                      <span>₹{order.grandTotal}</span>
                    </div>
                    <div className="order-cost-row discount">
                      <span>Discount</span>
                      <span>- ₹{order.discount}</span>
                    </div>
                    <div className="order-cost-row total">
                      <span className="flex items-center gap-2">
                        <FaMoneyBillWave />
                        Payable
                      </span>
                      <span>₹{order.finalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default OrderDetails;
