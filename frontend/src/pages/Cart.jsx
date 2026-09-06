import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency, imageUrl } from "../utils/format";
import { FaTrash } from "react-icons/fa";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();

  if (!loading && items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h4>Your cart is empty</h4>
        <p className="text-muted">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h4 className="mb-4">Shopping Cart</h4>
      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {items.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-3">
                  <img src={imageUrl(item.product.thumbnail)} style={{ width: 70, height: 70, objectFit: "contain" }} alt="" />
                  <div className="flex-grow-1 ms-3">
                    <Link to={`/product/${item.product.slug}`} className="text-decoration-none text-dark fw-semibold">
                      {item.product.name}
                    </Link>
                    <div className="text-primary small">{formatCurrency(item.product.final_price)}</div>
                  </div>
                  <div className="input-group" style={{ width: 120 }}>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                    <input readOnly className="form-control form-control-sm text-center" value={item.quantity} />
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="fw-bold mx-3" style={{ width: 100 }}>
                    {formatCurrency(item.product.final_price * item.quantity)}
                  </div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.id)}>
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <div className="d-flex justify-content-between my-2">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between my-2 text-muted small">
                <span>Shipping & tax calculated at checkout</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <button className="btn btn-primary w-100 mt-3" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
