import {useEffect, useState} from "react";
import {fetchProducts} from "../services/ProductService";
import type {Product} from "../interfaces/Product";
import ProductCard from "./ProductCard";
import "./Shop.css";

function Shop() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            const data = await fetchProducts();
            setProducts(data);
            setError("");
        } catch (err) {
            setError("Could not load products. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const categories = [
        "all",
        ...Array.from(new Set(products.map((p) => p.category || "")))
            .filter(Boolean),
    ];

    const filteredProducts =
        activeCategory === "all"
            ? products
            : products.filter((p) => p.category === activeCategory);

    function scrollToProducts() {
        document.getElementById("catalog-section")?.scrollIntoView({behavior: "smooth"});
    }

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="loader-container">
                    <div className="loader-spinner"></div>
                    <span className="loader-text">Loading ShopVibe collections...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-wrapper">
                <div className="shop-error glass-panel">
                    <p className="shop-error-title">⚠️ Could not load catalog</p>
                    <p className="shop-error-text">{error}</p>
                    <button className="btn btn-primary" onClick={loadProducts}>
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* ShopVibe Hero Banner Section (from Stitch design system) */}
            <section className="shop-hero">
                <div className="shop-hero-bg"></div>
                <div className="shop-hero-overlay"></div>
                
                <div className="shop-hero-card glass-panel">
                    <h1 className="shop-hero-title">
                        Curated Collections For You
                    </h1>
                    <p className="shop-hero-subtitle">
                        Discover handpicked products that blend style &amp; comfort seamlessly into your everyday life.
                    </p>
                    <button className="glass-btn shop-hero-cta" onClick={scrollToProducts}>
                        <span>Shop Now</span>
                        <span className="hero-cta-arrow">→</span>
                    </button>
                </div>
            </section>

            {/* Catalog Section Header & Filter Pills */}
            <section id="catalog-section" className="shop-catalog-header">
                <div className="shop-catalog-title-group">
                    <h2 className="shop-section-title">Explore Catalog</h2>
                    <p className="shop-section-subtitle">
                        Showing {filteredProducts.length} items across all categories
                    </p>
                </div>

                <div className="shop-filters" role="tablist" aria-label="Product categories">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            role="tab"
                            aria-selected={activeCategory === cat}
                            className={
                                "shop-filter-btn" +
                                (activeCategory === cat ? " active" : "")
                            }
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Product Grid */}
            <div className="product-grid">
                {filteredProducts.map((product, index) => (
                    <div
                        key={product.id}
                        className="product-grid-item"
                        style={{animationDelay: `${index * 50}ms`}}
                    >
                        <ProductCard product={product}/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Shop;
