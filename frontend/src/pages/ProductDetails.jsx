import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, imageUrl } from "../utils/format";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/product/ProductCard";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

export default function ProductDetails() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then((res) => setData(res.data)).finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className="container py-5 text-center">Product not found.</div>;

  const { product, related_products } = data;
  const hasDiscount = product.discount_price && Number(product.discount_price) > 0;

  const handleAddToCart = () => {
    if (!user) return navigate("/login");
    addToCart(product.id, qty);
  };

  const handleWishlist = async () => {
    if (!user) return navigate("/login");
    const res = await api.post("/wishlist/toggle", { product_id: product.id });
    toast.success(res.data.message);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-5">
          <div className="card shadow-sm">
            <img src={imageUrl(product.thumbnail)} className="card-img-top p-4" style={{ height: 380, objectFit: "contain" }} alt={product.name} />
          </div>
          {product.images?.length > 0 && (
            <div className="d-flex gap-2 mt-2 flex-wrap">
              {product.images.map((img) => (
                <img key={img.id} src={imageUrl(img.image)} style={{ width: 70, height: 70, objectFit: "contain" }} className="border rounded p-1" alt="" />
              ))}
            </div>
          )}
        </div>

        <div className="col-md-7">
          {product.brand && <div className="text-muted">{product.brand.name}</div>}
          <h3 className="fw-bold">{product.name}</h3>
          <div className="mb-2">
            <span className="badge bg-secondary me-2">SKU: {product.sku}</span>
            <span className={`badge ${product.stock_qty > 0 ? "bg-success" : "bg-danger"}`}>
              {product.stock_qty > 0 ? `${product.stock_qty} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 my-3">
            <span className="fs-3 fw-bold text-primary">{formatCurrency(product.final_price)}</span>
            {hasDiscount && <span className="text-muted text-decoration-line-through fs-5">{formatCurrency(product.price)}</span>}
          </div>

          <p className="text-muted">{product.description}</p>

          <div className="d-flex align-items-center gap-3 my-4">
            <div className="input-group" style={{ width: 130 }}>
              <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <input type="text" className="form-control text-center" readOnly value={qty} />
              <button className="btn btn-outline-secondary" onClick={() => setQty((q) => Math.min(product.stock_qty, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary px-4" disabled={product.stock_qty <= 0} onClick={handleAddToCart}>
              <FaShoppingCart className="me-2" />Add to Cart
            </button>
            <button className="btn btn-outline-danger" onClick={handleWishlist}>
              <FaHeart />
            </button>
          </div>

          {product.specification && (
            <div className="card mt-3">
              <div className="card-header fw-bold">Specification</div>
              <div className="card-body small text-muted">{product.specification}</div>
            </div>
          )}
        </div>
      </div>

      {related_products?.length > 0 && (
        <div className="mt-5">
          <h4 className="mb-4">Related Products</h4>
          <div className="row g-4">
            {related_products.map((p) => (
              <div className="col-6 col-md-3" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}