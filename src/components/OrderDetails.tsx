import { useState } from "react";
import type { Order } from "../interfaces/Order";
import "./OrderDetails.css";

function OrderDetails() {
    const [orders] = useState<Order[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("shopvibe-orders") || "[]");
        } catch {
            return [];
        }
    });

    if (orders.length === 0) {
        return (
            <div className="page-wrapper">
                <div className="empty-state">
                    <span className="material-symbols-outlined empty-state-icon">receipt_long</span>
                    <h2 className="empty-state-title">No Orders Yet</h2>
                    <p className="empty-state-text">
                        Your order history will appear here after you place your first order.
                    </p>
                    <a href="/" className="btn btn-primary btn-lg mt-4">Start Shopping</a>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper orders-page">
            <h1 className="page-title">Order History</h1>
            <p className="page-subtitle">You have {orders.length} order{orders.length !== 1 ? "s" : ""}</p>

            <div className="orders-list">
                {orders.map((order) => (
                    <article className="order-card glass-panel" key={order.id}>
                        <div className="order-card-header">
                            <div className="order-card-id">
                                <span className="material-symbols-outlined text-sm text-[var(--color-primary)]">receipt</span>
                                <span className="order-id-text">{order.id}</span>
                            </div>
                            <span className="order-date">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric", month: "short", day: "numeric",
                                })}
                            </span>
                        </div>

                        <div className="order-card-items">
                            {order.items.map((item, i) => (
                                <div className="order-card-item" key={`${order.id}-${i}`}>
                                    <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="order-item-img"
                                    />
                                    <div className="order-item-info">
                                        <span className="order-item-name">{item.name}</span>
                                        <span className="order-item-qty">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                                    </div>
                                    <span className="order-item-subtotal">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="order-card-footer">
                            <div className="order-card-meta">
                                <span className="order-meta-tag">
                                    <span className="material-symbols-outlined text-xs">credit_card</span>
                                    {order.paymentMethod}
                                </span>
                                <span className="order-meta-tag">
                                    <span className="material-symbols-outlined text-xs">local_shipping</span>
                                    {order.shippingMethod}
                                </span>
                            </div>
                            <div className="order-card-total">
                                <span>Total</span>
                                <span className="order-total-value">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

export default OrderDetails;
