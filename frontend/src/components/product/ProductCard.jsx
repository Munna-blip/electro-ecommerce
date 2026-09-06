import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart, FaShoppingCart, FaBolt } from "react-icons/fa";
import { formatCurrency, imageUrl } from "../../utils/format";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(product.is_wishlisted ?? false);
  const [busy, setBusy] = useState(false);

  const hasDiscount = product.discount_price && Number(product.discount_price) > 0;
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.discount_price) / Number(product.price)) * 100)
    : 0;

  const topSpecs = (product.specifications ?? []).slice(0, 3);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setBusy(true);
    try {
      await addToCart(product.id, 1);
    } finally {
      setBusy(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    setBusy(true);
    try {
      await addToCart(product.id, 1);
      navigate("/checkout");
    } finally {
      setBusy(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    try {
      const res = await api.post("/wishlist/toggle", { product_id: product.id });
      setWishlisted(res.data.wishlisted);
      toast.success(res.data.message);
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <div className="card h-100 shadow-sm product-card">
      <Link to={`/product/${product.slug}`} className="text-decoration-none text-dark">
        <div className="position-relative">
          <img
            src={imageUrl(product.thumbnail)}
            className="card-img-top p-3 product-card-img"
            style={{ height: 200, objectFit: "contain" }}
            alt={product.name}
          />
          {hasDiscount && (
            <span className="badge bg-danger position-absolute top-0 start-0 m-2">
              -{discountPercent}%
            </span>
          )}
          <button
            className="btn btn-sm btn-white position-absolute top-0 end-0 m-2 rounded-circle shadow-sm wishlist-btn"
            onClick={handleWishlist}
            title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlisted ? (
              <FaHeart className="text-danger" size={15} />
            ) : (
              <FaRegHeart className="text-dark" size={15} />
            )}
          </button>
          {product.stock_qty <= 0 && (
            <div className="position-absolute top-50 start-50 translate-middle">
              <span className="badge bg-dark bg-opacity-75 px-3 py-2">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="card-body pb-1">
          {product.brand && <div className="text-muted small mb-1">{product.brand.name}</div>}
          <h6 className="card-title mb-2 text-truncate" title={product.name}>{product.name}</h6>

          {topSpecs.length > 0 && (
            <div className="d-flex flex-wrap gap-1 mb-2">
              {topSpecs.map((spec, i) => (
                <span key={i} className="badge spec-badge">
                  {spec.value}
                </span>
              ))}
            </div>
          )}

          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="fw-bold text-primary fs-6">{formatCurrency(product.final_price ?? product.price)}</span>
            {hasDiscount && (
              <span className="text-muted text-decoration-line-through small">{formatCurrency(product.price)}</span>
            )}
          </div>
          <div className={`small ${product.stock_qty > 0 ? "text-success" : "text-danger"}`}>
            {product.stock_qty > 0 ? `In Stock (${product.stock_qty})` : "Out of Stock"}
          </div>
        </div>
      </Link>

      <div className="card-body pt-2 d-flex gap-2">
        <button
          className="btn btn-outline-primary btn-sm flex-grow-1"
          disabled={product.stock_qty <= 0 || busy}
          onClick={handleAddToCart}
        >
          <FaShoppingCart className="me-1" /> Cart
        </button>
        <button
          className="btn btn-primary btn-sm flex-grow-1"
          disabled={product.stock_qty <= 0 || busy}
          onClick={handleBuyNow}
        >
          <FaBolt className="me-1" /> Buy Now
        </button>
      </div>
    </div>
  );
}