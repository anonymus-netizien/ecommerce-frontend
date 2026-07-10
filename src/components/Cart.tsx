import {useContext, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {CartContext} from "../context/CartContext";
import {coupons} from "../data/Coupons";
import "./Cart.css";

function Cart() {
    const {cart, increaseQuantity, decreaseQuantity, removeFromCart, clearCart} =
        useContext(CartContext);

    const [showModal, setShowModal] = useState(false);
    const [couponPercent, setCouponPercent] = useState(0);
    const [message, setMessage] = useState("");
    const couponRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const shipping = cart.length > 0 ? 4.99 : 0;
    const discount = (subtotal * couponPercent) / 100;
    const finalAmount = subtotal + shipping - discount;

    const applyCoupon = () => {
        const couponCode = couponRef.current?.value.trim() || "";
        const coupon = coupons.find(
            (c) => c.code.toUpperCase() === couponCode.toUpperCase()
        );

        if (coupon) {
            setCouponPercent(coupon.discount);
            setMessage(`Coupon Applied (${coupon.discount}% OFF)`);
        } else {
            setCouponPercent(0);
            setMessage("Invalid Coupon Code");
        }
    };

    function handleCheckout() {
        navigate("/checkout", {
            state: {
                subtotal,
                shipping,
                couponPercent,
                discount
            }
        });
    }

    function handleConfirmOrder() {
        clearCart();
        setShowModal(false);
    }

    if (cart.length === 0 && !showModal) {
        return (
            <div className="page-wrapper">
                <div className="empty-state">
                    <span className="material-symbols-outlined empty-state-icon">shopping_cart</span>
                    <h2 className="empty-state-title">Your Cart is Empty</h2>
                    <p className="empty-state-text">
                        Looks like you haven&apos;t added any collections yet.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg">
                        Explore Collections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <h1 className="page-title text-center">Your Cart</h1>
            <p className="page-subtitle text-center">
                {totalItems} item{totalItems !== 1 ? "s" : ""} selected for checkout
            </p>

            <div className="cart-layout">
                {/* ── Items List ──────────────────── */}
                <div className="cart-items">
                    {cart.map((item, index) => (
                        <article
                            className="cart-item glass-panel"
                            key={item.id}
                            style={{animationDelay: `${index * 50}ms`}}
                        >
                            <div className="cart-item-image-wrapper">
                                <img
                                    className="cart-item-image"
                                    src={item.imageUrl}
                                    alt={item.name}
                                />
                            </div>

                            <div className="cart-item-details">
                                <h3 className="cart-item-name" title={item.name}>
                                    {item.name}
                                </h3>
                                <p className="cart-item-price">
                                    ${item.price.toFixed(2)} / unit
                                </p>
                            </div>

                            <div className="cart-item-controls">
                                <button
                                    type="button"
                                    className="cart-qty-btn"
                                    onClick={() => decreaseQuantity(item.id)}
                                    aria-label="Decrease quantity"
                                >
                                    <span className="material-symbols-outlined text-sm">remove</span>
                                </button>
                                <span className="cart-qty-value">
                                    {item.quantity}
                                </span>
                                <button
                                    type="button"
                                    className="cart-qty-btn"
                                    onClick={() => increaseQuantity(item.id)}
                                    aria-label="Increase quantity"
                                >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                </button>
                            </div>

                            <span className="cart-item-total">
                                ${(item.price * item.quantity).toFixed(2)}
                            </span>

                            <button
                                type="button"
                                className="cart-item-remove"
                                onClick={() => removeFromCart(item.id)}
                                aria-label="Remove item from cart"
                                title="Remove item"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </article>
                    ))}

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] font-medium transition-colors border-b border-transparent hover:border-[var(--color-danger)]"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    </div>
                </div>

                {/* ── Order Summary Panel ─────────── */}
                <aside className="cart-summary glass-panel">
                    <h2 className="cart-summary-title">Order Summary</h2>

                    <div className="cart-summary-row">
                        <span>Subtotal ({totalItems} items)</span>
                        <span className="cart-summary-value">
                            ${subtotal.toFixed(2)}
                        </span>
                    </div>

                    <div className="cart-summary-row">
                        <span>Shipping</span>
                        <span className="cart-summary-value">
                            ${shipping.toFixed(2)}
                        </span>
                    </div>

                    {/* ── Coupon Section ──────────────── */}
                    <div className="cart-coupon-row">
                        <input
                            ref={couponRef}
                            type="text"
                            placeholder="Coupon code"
                            className="cart-coupon-input"
                            aria-label="Enter coupon code"
                        />
                        <button
                            type="button"
                            onClick={applyCoupon}
                            className="cart-coupon-btn glass-btn"
                        >
                            Apply
                        </button>
                    </div>
                    {message && (
                        <p className="cart-coupon-message">{message}</p>
                    )}

                    {couponPercent > 0 && (
                        <div className="cart-summary-row discount">
                            <span>Discount ({couponPercent}%)</span>
                            <span className="cart-summary-value discount-val">
                                −${discount.toFixed(2)}
                            </span>
                        </div>
                    )}

                    <div className="cart-summary-row total">
                        <span>Grand Total</span>
                        <span className="cart-summary-value total-val">
                            ${finalAmount.toFixed(2)}
                        </span>
                    </div>

                    <button
                        type="button"
                        className="cart-checkout-btn glass-btn"
                        onClick={handleCheckout}
                    >
                        <span className="material-symbols-outlined text-white/80 group-hover:text-white transition-colors">lock</span>
                        <span>Proceed to Checkout</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </aside>
            </div>

            {/* ── Order Confirmed Modal ───────── */}
            {showModal && (
                <div className="modal-overlay fixed inset-0 bg-slate-900/65 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fadeIn" onClick={handleConfirmOrder}>
                    <div
                        className="modal-card glass-panel w-full max-w-[500px] mx-auto p-8 sm:p-10 rounded-3xl text-center shadow-2xl border border-[var(--color-border-glass)] bg-white/95 dark:bg-bg-start/95 transition-all animate-fadeInScale"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="material-symbols-outlined text-6xl mb-4 animate-bounce text-[var(--color-primary)]">celebration</span>
                        <h2 className="modal-title font-serif text-3xl font-extrabold text-[var(--color-text-dark)] mb-3">Order Confirmed!</h2>
                        <p className="modal-text text-base text-[var(--color-text-muted)] leading-relaxed mb-6">
                            Thank you for choosing ShopVibe. Your {totalItems} item
                            {totalItems !== 1 ? "s" : ""} will be shipped shortly.
                        </p>
                        <div className="modal-total py-3 px-6 bg-[#D4845A]/15 dark:bg-[#E5956B]/20 rounded-xl inline-block font-serif text-2xl font-bold text-[var(--color-primary)] mb-6 shadow-sm">
                            Total Paid: ${finalAmount.toFixed(2)}
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary btn-lg w-full py-4 text-base font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            onClick={handleConfirmOrder}
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
