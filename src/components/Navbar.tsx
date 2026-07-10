import { NavLink, useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import "./Navbar.css";

function Navbar() {
    const { cart } = useContext(CartContext);
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const location = useLocation();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    return (
        <header className="navbar">
            {/* Wood grain texture overlay */}
            <div className="navbar-wood-grain"></div>

            <div className="navbar-inner">
                {/* Brand + Search */}
                <div className="navbar-left">
                    <NavLink to="/" className="navbar-brand">
                        <span className="navbar-brand-text">ShopVibe</span>
                    </NavLink>

                    <div className="navbar-search-wrapper hidden md:flex">
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
                </div>

                {/* Nav Links (hidden on auth pages) */}
                {!isAuthPage && (
                    <nav className="navbar-nav hidden md:flex" aria-label="Main navigation">
                        <NavLink to="/" end className={({ isActive }) => `navbar-nav-link ${isActive ? "navbar-nav-link--active" : ""}`}>
                            Shop
                        </NavLink>
                        <a href="#" className="navbar-nav-link">Categories</a>
                        <a href="#" className="navbar-nav-link">Offers</a>
                        <a href="#" className="navbar-nav-link">About</a>
                    </nav>
                )}

                {/* Actions */}
                <div className="navbar-actions">
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
                            <NavLink to="/login" className="navbar-action-btn" aria-label="Account">
                                <span className="material-symbols-outlined">person</span>
                            </NavLink>

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
            </div>
        </header>
    );
}

export default Navbar;
