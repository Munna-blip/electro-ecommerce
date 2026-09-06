import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/format";
import { toast } from "react-toastify";

export default function Checkout() {
  const { items, subtotal, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    shipping_name: user?.name || "",
    shipping_phone: user?.phone || "",
    shipping_address: user?.address || "",
    payment_method: "cash",
    note: "",
  });

  const estimatedTax = items.reduce((sum, i) => sum + (i.product.final_price * i.quantity) * (i.product.tax_rate / 100), 0);
  const shippingFee = subtotal > 5000 ? 0 : 60;
  const total = subtotal + estimatedTax + shippingFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      // "online" is not a real payment_method column value in the backend enum,
      // so for online payments we still create the order as "cash" placeholder
      // and let SSLCommerz settle it; the backend marks it paid on successful callback.
      const payload = { ...form, payment_method: form.payment_method === "online" ? "card" : form.payment_method };
      const res = await api.post("/orders", payload);
      const order = res.data.order;
      await refreshCart();

      if (form.payment_method === "online") {
        // Redirect to SSLCommerz hosted payment page
        const gatewayRes = await api.post(`/payments/sslcommerz/initiate/${order.id}`);
        window.location.href = gatewayRes.data.gateway_url;
        return;
      }

      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        toast.error(err.response.data.message || "Please check the form");
      } else {
        toast.error(err.response?.data?.message || "Something went wrong placing your order");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <div className="container py-5 text-center">Your cart is empty. <a href="/shop">Go shopping</a></div>;
  }

  return (
    <div className="container py-4">
      <h4 className="mb-4">Checkout</h4>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-7">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title">Shipping Details</h5>
                <div className="mb-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" required value={form.shipping_name}
                    onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} />
                  {errors.shipping_name && <div className="text-danger small">{errors.shipping_name[0]}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" required value={form.shipping_phone}
                    onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} />
                  {errors.shipping_phone && <div className="text-danger small">{errors.shipping_phone[0]}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Delivery Address</label>
                  <textarea className="form-control" required rows={3} value={form.shipping_address}
                    onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} />
                  {errors.shipping_address && <div className="text-danger small">{errors.shipping_address[0]}</div>}
                </div>
                <div className="mb-3">
                  <label className="form-label">Order Note (optional)</label>
                  <textarea className="form-control" rows={2} value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Payment Method</h5>

                <div className="form-check border rounded p-3 mb-2">
                  <input className="form-check-input" type="radio" name="payment_method" id="pm_cash"
                    checked={form.payment_method === "cash"}
                    onChange={() => setForm({ ...form, payment_method: "cash" })} />
                  <label className="form-check-label w-100" htmlFor="pm_cash">
                    <strong>Cash on Delivery</strong>
                    <div className="text-muted small">Pay with cash when your order arrives</div>
                  </label>
                </div>

                <div className="form-check border rounded p-3 border-primary">
                  <input className="form-check-input" type="radio" name="payment_method" id="pm_online"
                    checked={form.payment_method === "online"}
                    onChange={() => setForm({ ...form, payment_method: "online" })} />
                  <label className="form-check-label w-100" htmlFor="pm_online">
                    <strong>Pay Online</strong>
                    <div className="text-muted small">bKash, Nagad, Rocket, Visa/Mastercard &amp; more via SSLCommerz</div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-5">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Order Summary</h5>
                {items.map((i) => (
                  <div key={i.id} className="d-flex justify-content-between small mb-2">
                    <span>{i.product.name} x{i.quantity}</span>
                    <span>{formatCurrency(i.product.final_price * i.quantity)}</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                <div className="d-flex justify-content-between"><span>Tax</span><span>{formatCurrency(estimatedTax)}</span></div>
                <div className="d-flex justify-content-between"><span>Shipping</span><span>{shippingFee === 0 ? "Free" : formatCurrency(shippingFee)}</span></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{formatCurrency(total)}</span></div>
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={submitting}>
                  {submitting
                    ? (form.payment_method === "online" ? "Redirecting to payment..." : "Placing Order...")
                    : (form.payment_method === "online" ? "Proceed to Pay" : "Place Order")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}