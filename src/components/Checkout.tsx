import React, { useContext, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { sendOrderConfirmation } from "../services/EmailService";
import type { Order } from "../interfaces/Order";
import "./Checkout.css";

function Checkout() {
    const { cart, clearCart } = useContext(CartContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Transferred state from Cart page
    const transferredState = location.state || {};
    const fallbackSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fallbackShipping = cart.length > 0 ? 4.99 : 0;

    const subtotal = transferredState.subtotal ?? fallbackSubtotal;
    const couponPercent = transferredState.couponPercent || 0;
    const baseShipping = transferredState.shipping ?? fallbackShipping;

    // Interactive Shipping Method
    const [shippingMethod, setShippingMethod] = useState<"standard" | "express" | "free">("standard");
    const currentShipping = shippingMethod === "express" ? 14.99 : shippingMethod === "free" ? 0 : baseShipping;

    // Calculate final totals
    const discountAmount = (subtotal * couponPercent) / 100;
    const totalAmount = subtotal + currentShipping - discountAmount;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Interactive Payment Method: Card, UPI (QR/VPA), COD, PayPal
    const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "cod" | "paypal">("card");

    // UPI Payment State
    const [upiMode, setUpiMode] = useState<"scanner" | "vpa">("scanner");
    const [upiId, setUpiId] = useState("");
    const [upiVerified, setUpiVerified] = useState(false);
    const [verifyingUpi, setVerifyingUpi] = useState(false);

    // Dynamic UPI QR Code Generation via public API (qrserver.com)
    const approxInr = (totalAmount * 84).toFixed(2);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=vlshu@slc&pn=ShopVibe&am=${totalAmount.toFixed(2)}&cu=INR&tn=Order%20Payment`)}`;

    // Order confirmation state
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState("");

    const emailRef = useRef<HTMLInputElement>(null);

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;

        if (paymentMethod === "upi" && upiMode === "vpa" && !upiVerified) {
            alert("Please verify your UPI ID before proceeding.");
            return;
        }

        const generatedId = "ORD-" + Math.floor(100000 + Math.random() * 900000);
        const customerEmail = emailRef.current?.value || "";
        const _firstName = (document.getElementById("checkout-fname") as HTMLInputElement)?.value || "Customer";

        // Save order to localStorage
        const order: any = { firstName: _firstName, 
            id: generatedId,
            items: cart.map((item) => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.imageUrl,
            })),
            subtotal,
            shipping: currentShipping,
            discount: discountAmount,
            total: totalAmount,
            email: customerEmail,
            paymentMethod,
            shippingMethod,
            createdAt: new Date().toISOString(),
        };
        const orders: Order[] = JSON.parse(localStorage.getItem("shopvibe-orders") || "[]");
        orders.push(order);
        localStorage.setItem("shopvibe-orders", JSON.stringify(orders));

        // Send order confirmation email (nested cost object for template {{cost.shipping}} etc.)
        sendOrderConfirmation({
            order_id: generatedId,
            orders: cart.map((item) => ({
                image_url: item.imageUrl,
                name: item.name,
                units: item.quantity,
                price: (item.price * item.quantity).toFixed(2),
            })),
            cost: {
                shipping: currentShipping.toFixed(2),
                tax: "0.00",
                total: totalAmount.toFixed(2),
            },
            coupon: couponPercent > 0 ? `${couponPercent}% OFF (-$${discountAmount.toFixed(2)})` : "None",
            email: customerEmail,
        });

        setOrderId(generatedId);
        clearCart();
        setOrderPlaced(true);
    };

    const verifyUpiId = () => {
        if (!upiId || !upiId.includes("@")) {
            alert("Please enter a valid UPI ID (e.g., username@okaxis)");
            return;
        }
        setVerifyingUpi(true);
        setTimeout(() => {
            setVerifyingUpi(false);
            setUpiVerified(true);
        }, 1200);
    };

    if (orderPlaced) {
        return (
            <div className="page-wrapper flex items-center justify-center min-h-[75vh]">
                <div className="modal-card glass-panel w-full max-w-[540px] mx-auto p-8 sm:p-10 rounded-3xl text-center shadow-2xl border border-[var(--color-border-glass)] bg-white/90 dark:bg-bg-start/95 transition-all duration-300 animate-fadeInScale">
                    <span className="material-symbols-outlined text-6xl mb-4 animate-bounce text-[var(--color-primary)]">celebration</span>
                    <h2 className="modal-title font-serif text-3xl sm:text-4xl font-extrabold text-[var(--color-text-dark)] mb-3 tracking-tight">
                        Order Confirmed!
                    </h2>
                    <p className="modal-text text-base text-[var(--color-text-muted)] leading-relaxed mb-6">
                        Thank you for choosing ShopVibe. Your order <strong className="text-[var(--color-primary)] font-bold">#{orderId}</strong> has been placed securely and is now processing.
                    </p>
                    <div className="checkout-confirm-box glass-panel p-6 rounded-2xl mb-8 space-y-4 text-left shadow-inner">
                        <div className="checkout-row flex items-center justify-between text-sm py-2 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--color-text-muted)] font-medium">Order Number</span>
                            <span className="font-mono font-bold text-[var(--color-text-dark)]">{orderId}</span>
                        </div>
                        <div className="checkout-row flex items-center justify-between text-sm py-2 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--color-text-muted)] font-medium">Payment Method</span>
                            <span className="checkout-row-value method-badge font-bold text-[var(--color-primary)] uppercase tracking-wide">
                                {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI / QR Code" : paymentMethod}
                            </span>
                        </div>
                        <div className="checkout-row flex items-center justify-between text-sm py-2 border-b border-black/5 dark:border-white/5">
                            <span className="text-[var(--color-text-muted)] font-medium">Estimated Delivery</span>
                            <span className="checkout-row-value font-semibold text-[var(--color-text-dark)]">
                                {shippingMethod === "express" ? "1–2 Business Days" : "3–5 Business Days"}
                            </span>
                        </div>
                        <div className="checkout-row flex items-center justify-between pt-3">
                            <span className="text-base font-bold text-[var(--color-text-dark)]">Total Amount Paid</span>
                            <span className="checkout-row-value paid-val font-serif text-2xl font-extrabold text-[var(--color-primary)]">
                                ${totalAmount.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary btn-lg w-full py-4 text-base font-bold rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        onClick={() => navigate("/")}
                    >
                        Return to Shop
                    </button>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="page-wrapper">
                <div className="empty-state">
                    <span className="material-symbols-outlined empty-state-icon">shopping_cart</span>
                    <h2 className="empty-state-title">Your Cart is Empty</h2>
                    <p className="empty-state-text">
                        You need to add curated collections to your cart before proceeding to checkout.
                    </p>
                    <Link to="/" className="btn btn-primary btn-lg mt-4">
                        Explore Collections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper checkout-page">
            <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--color-primary)]/10 pb-6">
                <div>
                    <h1 className="font-headline text-3xl lg:text-4xl font-bold tracking-tight text-[var(--color-text-dark)]">Secure Checkout</h1>
                </div>
                <div className="mt-4 md:mt-0 flex items-center justify-center text-sm font-medium text-[var(--color-text-muted)] bg-white/50 dark:bg-white/10 px-4 py-2 rounded-full glass-panel">
                    <span className="material-symbols-outlined text-green-500 mr-2 text-lg">lock</span>
                    256-bit SSL Encrypted
                </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
                <div className="checkout-layout">
                    {/* ── Left Column: Form Sections ─────────────── */}
                    <div className="checkout-form-container">
                        {/* ── Section 1: Contact Information ──────── */}
                        <section className="checkout-section glass-panel">
                            <div className="checkout-section-header">
                                <span className="checkout-section-step">1</span>
                                <h2 className="checkout-section-title">Contact Information</h2>
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="checkout-email" className="checkout-label">Email Address</label>
                                <input
                                    id="checkout-email"
                                    ref={emailRef}
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    className="checkout-input"
                                />
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="checkout-phone" className="checkout-label">Phone Number</label>
                                <input
                                    id="checkout-phone"
                                    type="tel"
                                    required
                                    placeholder="+1 (555) 000-0000"
                                    className="checkout-input"
                                />
                            </div>
                        </section>

                        {/* ── Section 2: Shipping Address ─────────── */}
                        <section className="checkout-section glass-panel">
                            <div className="checkout-section-header">
                                <span className="checkout-section-step">2</span>
                                <h2 className="checkout-section-title">Shipping Address</h2>
                            </div>
                            <div className="checkout-grid-2">
                                <div className="checkout-form-group">
                                    <label htmlFor="checkout-fname" className="checkout-label">First Name</label>
                                    <input id="checkout-fname" type="text" required placeholder="John" className="checkout-input" />
                                </div>
                                <div className="checkout-form-group">
                                    <label htmlFor="checkout-lname" className="checkout-label">Last Name</label>
                                    <input id="checkout-lname" type="text" required placeholder="Doe" className="checkout-input" />
                                </div>
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="checkout-street" className="checkout-label">Street Address</label>
                                <input id="checkout-street" type="text" required placeholder="123 Shopping Ave" className="checkout-input" />
                            </div>
                            <div className="checkout-form-group">
                                <label htmlFor="checkout-apt" className="checkout-label">Apartment, suite, etc. (optional)</label>
                                <input id="checkout-apt" type="text" placeholder="Apt 4B" className="checkout-input" />
                            </div>
                            <div className="checkout-grid-3">
                                <div className="checkout-form-group">
                                    <label htmlFor="checkout-city" className="checkout-label">City</label>
                                    <input id="checkout-city" type="text" required placeholder="New York" className="checkout-input" />
                                </div>
                                <div className="checkout-form-group">
                                    <label htmlFor="checkout-state" className="checkout-label">State / Province</label>
                                    <input id="checkout-state" type="text" required placeholder="NY" className="checkout-input" />
                                </div>
                                <div className="checkout-form-group">
                                    <label htmlFor="checkout-zip" className="checkout-label">ZIP / Postal</label>
                                    <input id="checkout-zip" type="text" required placeholder="10001" className="checkout-input" />
                                </div>
                            </div>
                        </section>

                        {/* ── Section 3: Shipping Method ──────────── */}
                        <section className="checkout-section glass-panel">
                            <div className="checkout-section-header">
                                <span className="checkout-section-step">3</span>
                                <h2 className="checkout-section-title">Shipping Method</h2>
                            </div>
                            <div className="checkout-options-grid">
                                <div
                                    className={`checkout-option-card ${shippingMethod === "standard" ? "selected" : ""}`}
                                    onClick={() => setShippingMethod("standard")}
                                    role="radio"
                                    aria-checked={shippingMethod === "standard"}
                                    tabIndex={0}
                                >
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title">Standard Shipping</span>
                                        <span className="checkout-option-subtitle">3–5 Business Days</span>
                                    </div>
                                    <span className="checkout-option-price">${baseShipping.toFixed(2)}</span>
                                </div>

                                <div
                                    className={`checkout-option-card ${shippingMethod === "express" ? "selected" : ""}`}
                                    onClick={() => setShippingMethod("express")}
                                    role="radio"
                                    aria-checked={shippingMethod === "express"}
                                    tabIndex={0}
                                >
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title">Express Shipping</span>
                                        <span className="checkout-option-subtitle">1–2 Business Days</span>
                                    </div>
                                    <span className="checkout-option-price">$14.99</span>
                                </div>
                            </div>
                        </section>

                        {/* ── Section 4: Payment Method ───────────── */}
                        <section className="checkout-section glass-panel">
                            <div className="checkout-section-header">
                                <span className="checkout-section-step">4</span>
                                <h2 className="checkout-section-title">Payment</h2>
                            </div>
                            <div className="checkout-payment-grid">
                                {/* Credit Card Option */}
                                <div
                                    className={`checkout-option-card ${paymentMethod === "card" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("card")}
                                    role="radio"
                                    aria-checked={paymentMethod === "card"}
                                    tabIndex={0}
                                >
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title flex items-center">
                                            <span className="material-symbols-outlined mr-2 text-[var(--color-text-muted)]">credit_card</span>
                                            Credit Card
                                        </span>
                                        <span className="checkout-option-subtitle">Visa, Mastercard, Amex</span>
                                    </div>
                                </div>

                                {/* UPI / QR Code Option */}
                                <div
                                    className={`checkout-option-card ${paymentMethod === "upi" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("upi")}
                                    role="radio"
                                    aria-checked={paymentMethod === "upi"}
                                    tabIndex={0}
                                >
                                    <span className="checkout-option-badge">Popular</span>
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title flex items-center">
                                            <span className="material-symbols-outlined mr-2 text-[var(--color-text-muted)]">qr_code_scanner</span>
                                            UPI / QR Code
                                        </span>
                                        <span className="checkout-option-subtitle">GPay, PhonePe, Paytm</span>
                                    </div>
                                </div>

                                {/* Cash on Delivery Option */}
                                <div
                                    className={`checkout-option-card ${paymentMethod === "cod" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("cod")}
                                    role="radio"
                                    aria-checked={paymentMethod === "cod"}
                                    tabIndex={0}
                                >
                                    <span className="checkout-option-badge green">No Extra Fee</span>
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title flex items-center">
                                            <span className="material-symbols-outlined mr-2 text-[var(--color-text-muted)]">paid</span>
                                            Cash on Delivery
                                        </span>
                                        <span className="checkout-option-subtitle">Pay upon receiving order</span>
                                    </div>
                                </div>

                                {/* PayPal Option */}
                                <div
                                    className={`checkout-option-card ${paymentMethod === "paypal" ? "selected" : ""}`}
                                    onClick={() => setPaymentMethod("paypal")}
                                    role="radio"
                                    aria-checked={paymentMethod === "paypal"}
                                    tabIndex={0}
                                >
                                    <div className="checkout-option-radio">
                                        <div className="checkout-option-radio-inner" />
                                    </div>
                                    <div className="checkout-option-details">
                                        <span className="checkout-option-title flex items-center">
                                            <span className="material-symbols-outlined mr-2 text-[var(--color-text-muted)]">account_balance_wallet</span>
                                            PayPal Gateway
                                        </span>
                                        <span className="checkout-option-subtitle">Fast &amp; encrypted checkout</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Card Payment Form ───────────────── */}
                            {paymentMethod === "card" && (
                                <div className="checkout-payment-subform">
                                    <div className="checkout-form-group">
                                        <label htmlFor="card-number" className="checkout-label">Card Number</label>
                                        <div className="relative">
                                            <input
                                                id="card-number"
                                                type="text"
                                                required
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={19}
                                                className="checkout-input pl-10"
                                            />
                                            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[var(--color-text-dim)]">credit_card</span>
                                        </div>
                                    </div>
                                    <div className="checkout-grid-2">
                                        <div className="checkout-form-group">
                                            <label htmlFor="card-exp" className="checkout-label">Expiry Date</label>
                                            <input id="card-exp" type="text" required placeholder="MM / YY" maxLength={5} className="checkout-input" />
                                        </div>
                                        <div className="checkout-form-group">
                                            <label htmlFor="card-cvv" className="checkout-label">CVC</label>
                                            <input id="card-cvv" type="password" required placeholder="123" maxLength={4} className="checkout-input" />
                                        </div>
                                    </div>
                                    <div className="checkout-form-group">
                                        <label htmlFor="card-name" className="checkout-label">Name on Card</label>
                                        <input id="card-name" type="text" required placeholder="John Doe" className="checkout-input" />
                                    </div>
                                    <div className="checkout-secure-badge">
                                        <span className="material-symbols-outlined text-sm">lock</span>
                                        <span>256-bit SSL Encrypted. Your card details are never stored on our servers.</span>
                                    </div>
                                </div>
                            )}

                            {/* ── UPI / QR Code Section ───────────── */}
                            {paymentMethod === "upi" && (
                                <div className="checkout-upi-container glass-panel">
                                    <div className="checkout-upi-header">
                                        <div className="checkout-upi-title">
                                            <span className="flex items-center gap-2">
                                                <span className="material-symbols-outlined">bolt</span>
                                                Instant UPI Payment
                                            </span>
                                        </div>
                                        <div className="checkout-upi-tabs">
                                            <button
                                                type="button"
                                                className={`checkout-upi-tab ${upiMode === "scanner" ? "active" : ""}`}
                                                onClick={() => setUpiMode("scanner")}
                                            >
                                                <span className="material-symbols-outlined text-sm mr-1">photo_camera</span>
                                                Scan QR Code
                                            </button>
                                            <button
                                                type="button"
                                                className={`checkout-upi-tab ${upiMode === "vpa" ? "active" : ""}`}
                                                onClick={() => setUpiMode("vpa")}
                                            >
                                                <span className="material-symbols-outlined text-sm mr-1">keyboard</span>
                                                Enter UPI ID
                                            </button>
                                        </div>
                                    </div>

                                    {upiMode === "scanner" ? (
                                        <div className="checkout-qr-box">
                                            <div className="checkout-qr-image-wrapper" title="Scan with any UPI App">
                                                <img
                                                    src={qrCodeUrl}
                                                    alt="UPI Payment QR Code"
                                                    className="checkout-qr-image"
                                                />
                                            </div>
                                            <div className="text-center">
                                                <p className="qr-instruction">
                                                    Scan with any UPI App to Pay ${totalAmount.toFixed(2)} (≈ ₹{approxInr})
                                                </p>
                                                <p className="qr-merchant">
                                                    Merchant VPA: <strong>vlshu@slc</strong>
                                                </p>
                                            </div>
                                            <div className="checkout-qr-apps">
                                                <span className="checkout-qr-app-badge">GPay</span>
                                                <span className="checkout-qr-app-badge">PhonePe</span>
                                                <span className="checkout-qr-app-badge">Paytm</span>
                                                <span className="checkout-qr-app-badge">BHIM</span>
                                            </div>
                                            {upiVerified ? (
                                                <div className="upi-confirmed-banner">
                                                    <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                                    QR Scanner Payment Confirmed! You may now place order.
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setUpiVerified(true)}
                                                    className="checkout-upi-verify-btn btn-outline w-full"
                                                >
                                                    <span className="material-symbols-outlined text-sm mr-1">check_circle</span>
                                                    I have scanned &amp; paid via QR
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="checkout-upi-vpa-box">
                                            <label htmlFor="upi-id-input" className="checkout-label">
                                                Enter Virtual Payment Address (VPA) / UPI ID
                                            </label>
                                            <div className="checkout-upi-verify-row">
                                                <input
                                                    id="upi-id-input"
                                                    type="text"
                                                    value={upiId}
                                                    onChange={(e) => {
                                                        setUpiId(e.target.value);
                                                        setUpiVerified(false);
                                                    }}
                                                    placeholder="e.g., username@okaxis, phone@paytm"
                                                    className="checkout-input"
                                                />
                                                {upiVerified ? (
                                                    <span className="upi-verified-text flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                                        Verified ({upiId})
                                                    </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={verifyUpiId}
                                                        disabled={verifyingUpi || !upiId.includes("@")}
                                                        className="checkout-upi-verify-btn btn-primary"
                                                    >
                                                        {verifyingUpi ? "Verifying..." : "Verify UPI ID"}
                                                    </button>
                                                )}
                                            </div>
                                            <p className="upi-note">
                                                We will send a payment request of ${totalAmount.toFixed(2)} directly to your UPI mobile app.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Cash on Delivery Section ────────── */}
                            {paymentMethod === "cod" && (
                                <div className="checkout-cod-container glass-panel">
                                    <div className="checkout-cod-header">
                                        <span className="material-symbols-outlined text-3xl text-[var(--color-primary)]">paid</span>
                                        <div>
                                            <h3 className="checkout-cod-title">Cash on Delivery (COD) Available</h3>
                                            <p className="checkout-cod-desc">
                                                Pay comfortably when your order is delivered right to your doorstep.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="checkout-cod-list">
                                        <div className="checkout-cod-item">
                                            <span className="material-symbols-outlined text-[var(--color-success)] text-sm">check</span>
                                            <span>No online payment required now — pay exact cash or UPI to delivery partner.</span>
                                        </div>
                                        <div className="checkout-cod-item">
                                            <span className="material-symbols-outlined text-[var(--color-success)] text-sm">check</span>
                                            <span>Secure delivery verification OTP sent via SMS upon arrival.</span>
                                        </div>
                                        <div className="checkout-cod-item">
                                            <span className="material-symbols-outlined text-[var(--color-success)] text-sm">check</span>
                                            <span>Real-time order tracking link &amp; updates sent via email immediately after placing order.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── PayPal Section ──────────────────── */}
                            {paymentMethod === "paypal" && (
                                <div className="checkout-paypal-box glass-panel">
                                    <p className="paypal-title flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[var(--color-primary)]">account_balance_wallet</span>
                                        Redirecting to PayPal Express Checkout
                                    </p>
                                    <p className="paypal-desc">
                                        When you click <strong>Continue to PayPal</strong> below, you will be securely redirected to PayPal&apos;s portal to complete your transaction of ${totalAmount.toFixed(2)}.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* ── Right Column: Order Summary (Sticky) ───── */}
                    <aside className="checkout-summary glass-panel">
                        <div className="checkout-summary-title">
                            <span>Order Summary</span>
                            <span className="checkout-summary-badge">{totalItems} Item{totalItems !== 1 ? "s" : ""}</span>
                        </div>

                        {/* Transferred Cart Items List */}
                        <div className="checkout-items-list">
                            {cart.map((item) => (
                                <div className="checkout-item" key={item.id}>
                                    <div className="checkout-item-img-wrapper">
                                        <img src={item.imageUrl} alt={item.name} className="checkout-item-img" />
                                        <span className="checkout-item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="checkout-item-info">
                                        <h4 className="checkout-item-name">{item.name}</h4>
                                        <p className="checkout-item-price">${item.price.toFixed(2)} / unit</p>
                                    </div>
                                    <span className="checkout-item-total">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Cost Breakdown */}
                        <div className="checkout-breakdown">
                            <div className="checkout-row">
                                <span>Subtotal</span>
                                <span className="checkout-row-value">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="checkout-row">
                                <span>Shipping ({shippingMethod.toUpperCase()})</span>
                                <span className="checkout-row-value">
                                    {currentShipping === 0 ? "FREE" : `$${currentShipping.toFixed(2)}`}
                                </span>
                            </div>
                            {couponPercent > 0 && (
                                <div className="checkout-row discount">
                                    <span>Discount ({couponPercent}% OFF)</span>
                                    <span className="checkout-row-value">−${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="checkout-row total">
                                <span>Total to Pay</span>
                                <span className="checkout-row-value total-val">${totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" className="checkout-submit-btn glass-btn group">
                            <span className="material-symbols-outlined text-white/80">lock</span>
                            <span>
                                {paymentMethod === "card"
                                    ? `Pay $${totalAmount.toFixed(2)} Securely`
                                    : paymentMethod === "upi"
                                    ? `Pay $${totalAmount.toFixed(2)} via UPI`
                                    : paymentMethod === "cod"
                                    ? `Place COD Order ($${totalAmount.toFixed(2)})`
                                    : `Continue to PayPal ($${totalAmount.toFixed(2)})`}
                            </span>
                        </button>

                        <div className="checkout-trust-grid">
                            <div className="checkout-trust-item">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                <span>30-Day Guarantee</span>
                            </div>
                            <div className="checkout-trust-item">
                                <span className="material-symbols-outlined text-sm">local_shipping</span>
                                <span>Fast Shipping</span>
                            </div>
                            <div className="checkout-trust-item">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                <span>Secure Checkout</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </form>
        </div>
    );
}

export default Checkout;
