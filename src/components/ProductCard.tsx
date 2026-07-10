import {useContext, useState} from "react";
import {CartContext} from "../context/CartContext";
import type {Product} from "../interfaces/Product";
import "./ProductCard.css";

interface ProductCardProps {
    product: Product;
}

function ProductCard({product}: ProductCardProps) {
    const {addToCart} = useContext(CartContext);
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);

    function handleAddToCart() {
        addToCart(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    }

    function toggleWishlist() {
        setWishlisted((prev) => !prev);
    }

    return (
        <article className="product-card glass-panel">
            <div className="product-card-image-wrapper">
                <img
                    className="product-card-image"
                    src={product.imageUrl}
                    alt={product.name}
                />
                <button
                    type="button"
                    className={`product-card-wishlist-btn ${wishlisted ? "active" : ""}`}
                    onClick={toggleWishlist}
                    aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                    <span className="material-symbols-outlined text-[18px]">
                        {wishlisted ? "favorite" : "favorite_border"}
                    </span>
                </button>
                {product.category && (
                    <span className="product-card-category-badge">
                        {product.category}
                    </span>
                )}
            </div>

            <div className="product-card-body">
                {product.rating && (
                    <div className="product-card-rating">
                        <span className="product-card-stars">
                            {Array.from({length: 5}, (_, i) => {
                                const filled = i < Math.floor(product.rating!.rate);
                                const half = !filled && i < product.rating!.rate;
                                return (
                                    <span
                                        key={i}
                                        className="material-symbols-outlined text-[var(--color-primary)]"
                                        style={{
                                            fontVariationSettings: half ? "'FILL' 0.5" : filled ? "'FILL' 1" : "'FILL' 0",
                                            fontSize: "16px"
                                        }}
                                    >
                                        {half ? "star_half" : "star"}
                                    </span>
                                );
                            })}
                        </span>
                        <span className="rating-score">{product.rating.rate}</span>
                        <span className="rating-count">({product.rating.count})</span>
                    </div>
                )}

                <h3 className="product-card-title" title={product.name}>
                    {product.name}
                </h3>

                <p className="product-card-description">
                    {product.description}
                </p>

                <div className="product-card-footer">
                    <span className="product-card-price">
                        ${product.price.toFixed(2)}
                    </span>
                    <button
                        type="button"
                        className={`product-card-add-btn glass-btn ${added ? "added" : ""}`}
                        onClick={handleAddToCart}
                        aria-label="Add to cart"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {added ? "check" : "add"}
                        </span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
