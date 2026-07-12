import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

// ponytail: killed useOverflowDetection — CSS media queries handle responsive, no JS measurement loop

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

    useEffect(() => {
        const saved = localStorage.getItem("currentUser");
        setUser(saved ? JSON.parse(saved) : null);
    }, [location.pathname]);

    useEffect(() => {
        setMobileNavOpen(false);
    }, [location.pathname]);

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

    return (
        <header className="navbar">
            <div className="navbar-wood-grain"></div>

            <div className="navbar-inner">
                {/* Brand */}
                <NavLink to="/" className="navbar-brand">
                    <span className="navbar-brand-text">ShopVibe</span>
                </NavLink>

                {/* Search — desktop only */}
                {!isAuthPage && (
                    <div className="navbar-search-wrapper">
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

                {/* Nav Links — desktop only via CSS */}
                {!isAuthPage && (
                    <nav className="navbar-nav" aria-label="Main navigation">
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

                {/* Actions — always visible, flex-shrink handles sizing */}
                <div className="navbar-actions">
                    {/* Hamburger — mobile only via CSS */}
                    {!isAuthPage && (
                        <button
                            className="navbar-mobile-toggle"
                            onClick={() => setMobileNavOpen(!mobileNavOpen)}
                            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileNavOpen}
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
                                        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                                        className="navbar-action-btn"
                                        aria-label="Account Menu"
                                        title={`Logged in as ${user.name}`}
                                    >
                                        <span className="material-symbols-outlined">person</span>
                                    </button>
                                    {menuOpen && (
                                        <div className="navbar-user-dropdown" onClick={(e) => e.stopPropagation()}>
                                            <div className="dropdown-header-title">Logged In As</div>
                                            <div className="dropdown-user-welcome">Welcome, {user.name}!</div>
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

                            <button className="navbar-action-btn navbar-wishlist-btn" aria-label="Wishlist">
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
            </div>

            {/* Mobile drawer */}
            {!isAuthPage && mobileNavOpen && (
                <MobileDrawer
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onClose={() => setMobileNavOpen(false)}
                />
            )}
        </header>
    );
}

function MobileDrawer({ searchQuery, onSearchChange, onClose }: {
    searchQuery: string; onSearchChange: (q: string) => void;
    onClose: () => void;
}) {
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { drawerRef.current?.focus(); }, []);
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div className="navbar-mobile-drawer" role="dialog" aria-label="Navigation menu" ref={drawerRef} tabIndex={-1}>
            <div className="navbar-mobile-search">
                <span className="material-symbols-outlined navbar-search-icon">search</span>
                <input type="text" className="navbar-search-input" placeholder="Search..." value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)} aria-label="Search products" />
            </div>
            <NavLink to="/" end className={({ isActive }) => `navbar-mobile-link ${isActive ? "navbar-mobile-link--active" : ""}`} onClick={onClose}>
                <span className="material-symbols-outlined">store</span> Shop
            </NavLink>
            <NavLink to="/#catalog-section" className="navbar-mobile-link" onClick={onClose}>
                <span className="material-symbols-outlined">category</span> Categories
            </NavLink>
            <a href="#" className="navbar-mobile-link"><span className="material-symbols-outlined">local_offer</span> Offers</a>
            <a href="#" className="navbar-mobile-link"><span className="material-symbols-outlined">info</span> About</a>
        </div>
    );
}

export default Navbar;
