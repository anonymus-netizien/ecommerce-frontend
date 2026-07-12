import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import { useOverflowDetection } from "../hooks/useOverflowDetection";
import "./Navbar.css";

function Navbar() {
    const { cart } = useContext(CartContext);
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const navigate = useNavigate();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    // Refs for overflow detection
    const navbarInnerRef = useRef<HTMLDivElement>(null);
    const navLinksRef = useRef<HTMLElement>(null);
    const actionsRef = useRef<HTMLDivElement>(null);

    // Adaptive overflow detection — replaces fixed breakpoints
    const isNavOverflowing = useOverflowDetection(navbarInnerRef, navLinksRef, actionsRef);

    // Sync logged in user state on navigation/pathname change
    useEffect(() => {
        const saved = localStorage.getItem("currentUser");
        setUser(saved ? JSON.parse(saved) : null);
    }, [location.pathname]);

    // Close mobile nav on route change
    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

    // Handle outside clicks to close dropdown menu
    useEffect(() => {
        if (!menuOpen) return;
        const handleOutsideClick = () => setMenuOpen(false);
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, [menuOpen]);

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        setUser(null);
        setMenuOpen(false);
        navigate("/login");
    };

    const handleDrawerToggle = () => {
        setMobileNavOpen(!mobileNavOpen);
    };

    return (
        <header className="navbar">
            {/* Wood grain texture overlay */}
            <div className="navbar-wood-grain"></div>

            <div className="navbar-inner" ref={navbarInnerRef}>
                {/* Brand + Search */}
                <div className="navbar-left">
                    <NavLink to="/" className="navbar-brand">
                        <span className="navbar-brand-text">ShopVibe</span>
                    </NavLink>

                    {/* Search: always visible on desktop, in drawer on mobile */}
                    {!isAuthPage && (
                        <div className={`navbar-search-wrapper ${isNavOverflowing ? "navbar-search--hidden" : ""}`}>
                            <span className="material-symbols-outlined navbar-search-icon">search</span>
                            <input
                                type="text"
                                className="navbar-search-input"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search products"
                            />
                        </div>
                    )}
                </div>

                {/* Nav Links — hidden when overflowing, visible when enough space */}
                {!isAuthPage && (
                    <nav
                        ref={navLinksRef}
                        className={`navbar-nav ${isNavOverflowing ? "navbar-nav--hidden" : ""}`}
                        aria-label="Main navigation"
                    >
                        <NavLink to="/" end className={({ isActive }) => `navbar-nav-link ${isActive ? "navbar-nav-link--active" : ""}`}>
                            Shop
                        </NavLink>
                        <NavLink
                            to="/#catalog-section"
                            onClick={(e) => {
                                if (location.pathname === "/") {
                                    e.preventDefault();
                                    document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                            className={({ isActive }) => `navbar-nav-link ${isActive && location.hash === "#catalog-section" ? "navbar-nav-link--active" : ""}`}
                        >
                            Categories
                        </NavLink>
                        <a href="#" className="navbar-nav-link">Offers</a>
                        <a href="#" className="navbar-nav-link">About</a>
                    </nav>
                )}

                {/* Actions */}
                <div className="navbar-actions" ref={actionsRef}>
                    {/* Hamburger — shown when nav overflows or drawer is open */}
                    {!isAuthPage && (
                        <button
                            className={`navbar-mobile-toggle ${isNavOverflowing || mobileNavOpen ? "" : "navbar-mobile-toggle--desktop-hidden"}`}
                            onClick={handleDrawerToggle}
                            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileNavOpen}
                            aria-controls="mobile-nav-drawer"
                        >
                            <span className="material-symbols-outlined">
                                {mobileNavOpen ? "close" : "menu"}
                            </span>
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="navbar-action-btn"
                        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                        title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                    >
                        <span className="material-symbols-outlined">
                            {theme === "light" ? "dark_mode" : "light_mode"}
                        </span>
                    </button>

                    {!isAuthPage && (
                        <>
                            {user ? (
                                <div className="navbar-user-container">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(!menuOpen);
                                        }}
                                        className={`navbar-action-btn ${menuOpen ? "text-[#D4845A]" : ""}`}
                                        aria-label="Account Menu"
                                        title={`Logged in as ${user.name}`}
                                    >
                                        <span className="material-symbols-outlined">person</span>
                                    </button>
                                    {menuOpen && (
                                        <div className="navbar-user-dropdown" onClick={(e) => e.stopPropagation()}>
                                            <div className="dropdown-header-title">Logged In As</div>
                                            <div className="dropdown-user-welcome">
                                                Welcome, {user.name}!
                                            </div>
                                            <div className="dropdown-divider"></div>
                                            <NavLink to="/orders" className="dropdown-order-link" onClick={() => setMenuOpen(false)}>
                                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                                <span>My Orders</span>
                                            </NavLink>
                                            <div className="dropdown-divider"></div>
                                            <button className="dropdown-logout-btn" onClick={handleLogout}>
                                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <NavLink to="/login" state={{ from: location.pathname }} className="navbar-action-btn" aria-label="Account">
                                    <span className="material-symbols-outlined">person</span>
                                </NavLink>
                            )}

                            <button className="navbar-action-btn relative" aria-label="Wishlist">
                                <span className="material-symbols-outlined">favorite</span>
                                <span className="navbar-wishlist-dot"></span>
                            </button>

                            <NavLink to="/cart" className="navbar-cart-btn">
                                <span className="material-symbols-outlined navbar-cart-icon">shopping_cart</span>
                                <span className="navbar-cart-label">Cart</span>
                                {totalItems > 0 && (
                                    <span className="navbar-badge">{totalItems}</span>
                                )}
                            </NavLink>
                        </>
                    )}
                </div>

                {/* Mobile nav drawer — shown when hamburger is active and drawer is open */}
                {!isAuthPage && mobileNavOpen && (
                    <MobileDrawer
                        searchQuery={searchQuery}
                        onSearchChange={(q) => setSearchQuery(q)}
                        user={user}
                        pathname={location.pathname}
                        onClose={() => setMobileNavOpen(false)}
                        onLogout={handleLogout}
                    />
                )}
            </div>
        </header>
    );
}

// ── Mobile Drawer (auto-focuses on mount for keyboard a11y) ──
function MobileDrawer({
    searchQuery,
    onSearchChange,
    user,
    pathname,
    onClose,
    onLogout,
}: {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    user: any;
    pathname: string;
    onClose: () => void;
    onLogout: () => void;
}) {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        drawerRef.current?.focus();
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            id="mobile-nav-drawer"
            className="navbar-mobile-drawer"
            role="dialog"
            aria-label="Navigation menu"
            ref={drawerRef}
            tabIndex={-1}
        >
            <div className="navbar-mobile-search">
                <span className="material-symbols-outlined navbar-search-icon">search</span>
                <input
                    type="text"
                    className="navbar-search-input"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Search products"
                />
            </div>
            <NavLink to="/" end className={({ isActive }) => `navbar-mobile-link ${isActive ? "navbar-mobile-link--active" : ""}`} onClick={onClose}>
                <span className="material-symbols-outlined">store</span>
                Shop
            </NavLink>
            <NavLink to="/#catalog-section" className="navbar-mobile-link" onClick={() => { onClose(); if (pathname === "/") document.getElementById("catalog-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                <span className="material-symbols-outlined">category</span>
                Categories
            </NavLink>
            <a href="#" className="navbar-mobile-link">
                <span className="material-symbols-outlined">local_offer</span>
                Offers
            </a>
            <a href="#" className="navbar-mobile-link">
                <span className="material-symbols-outlined">info</span>
                About
            </a>
            <div className="dropdown-divider"></div>
            {user ? (
                <button className="navbar-mobile-link" onClick={() => { onClose(); onLogout(); }}>
                    <span className="material-symbols-outlined">logout</span>
                    Logout
                </button>
            ) : (
                <NavLink to="/login" state={{ from: pathname }} className="navbar-mobile-link" onClick={onClose}>
                    <span className="material-symbols-outlined">login</span>
                    Login
                </NavLink>
            )}
        </div>
    );
}

export default Navbar;
