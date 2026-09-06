import { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import { formatCurrency, imageUrl } from "../../utils/format";
import { toast } from "react-toastify";
import { FaBarcode, FaTrash, FaPrint } from "react-icons/fa";

export default function POS() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    api.get("/admin/customers", { params: { per_page: 100 } }).then((res) => setCustomers(res.data.data));
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const timer = setTimeout(() => {
      api.get("/admin/pos/search", { params: { q: query } }).then((res) => setResults(res.data));
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        product_id: product.id, name: product.name, price: product.discount_price || product.price,
        tax_rate: product.tax_rate, quantity: 1, stock_qty: product.stock_qty, thumbnail: product.thumbnail,
      }];
    });
    setQuery(""); setResults([]);
    searchRef.current?.focus();
  };

  const handleBarcodeEnter = async (e) => {
    if (e.key !== "Enter" || !query) return;
    try {
      const res = await api.get("/admin/pos/scan", { params: { barcode: query } });
      addToCart(res.data);
    } catch (err) {
      toast.error("Product not found for this barcode");
      setQuery("");
    }
  };

  const updateQty = (productId, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => i.product_id === productId ? { ...i, quantity: qty } : i));
  };
  const removeItem = (productId) => setCart((prev) => prev.filter((i) => i.product_id !== productId));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = cart.reduce((sum, i) => sum + i.price * i.quantity * (i.tax_rate / 100), 0);
  const total = Math.max(subtotal + tax - Number(discount || 0), 0);
  const change = Math.max((Number(paidAmount) || 0) - total, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    setSubmitting(true);
    try {
      const res = await api.post("/admin/pos/checkout", {
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        discount: Number(discount) || 0,
        payment_method: paymentMethod,
        customer_id: customerId || undefined,
        paid_amount: Number(paidAmount) || total,
      });
      toast.success("Sale completed!");
      setReceipt(res.data.order);
      setCart([]); setDiscount(0); setPaidAmount(""); setCustomerId("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row g-3">
      <div className="col-md-7">
        <div className="card shadow-sm mb-3">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text"><FaBarcode /></span>
              <input
                ref={searchRef}
                className="form-control form-control-lg"
                placeholder="Scan barcode or search product name / SKU..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleBarcodeEnter}
                autoFocus
              />
            </div>
            {results.length > 0 && (
              <div className="list-group mt-2" style={{ maxHeight: 260, overflowY: "auto" }}>
                {results.map((p) => (
                  <button key={p.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    onClick={() => addToCart(p)} disabled={p.stock_qty <= 0}>
                    <span><img src={imageUrl(p.thumbnail)} width={30} height={30} style={{ objectFit: "contain" }} className="me-2" alt="" />{p.name} <span className="text-muted small">({p.sku})</span></span>
                    <span>{formatCurrency(p.discount_price || p.price)} · Stock: {p.stock_qty}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="fw-bold">Cart ({cart.length} items)</h6>
            {cart.length === 0 ? (
              <p className="text-muted text-center py-4">Search or scan a product to begin a sale.</p>
            ) : (
              <table className="table align-middle">
                <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.product_id}>
                      <td>{item.name}</td>
                      <td>{formatCurrency(item.price)}</td>
                      <td style={{ width: 100 }}>
                        <input type="number" min="1" max={item.stock_qty} className="form-control form-control-sm"
                          value={item.quantity} onChange={(e) => updateQty(item.product_id, Number(e.target.value))} />
                      </td>
                      <td>{formatCurrency(item.price * item.quantity)}</td>
                      <td><button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item.product_id)}><FaTrash /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="col-md-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Checkout</h5>

            <div className="mb-3">
              <label className="form-label">Customer (optional)</label>
              <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">Walk-in Customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="d-flex justify-content-between mb-1"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
            <div className="mb-2">
              <label className="form-label">Discount (৳)</label>
              <input type="number" min="0" className="form-control" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-4 mb-3"><span>Total</span><span>{formatCurrency(total)}</span></div>

            <div className="mb-2">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="mobile_banking">Mobile Banking</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Amount Paid</label>
              <input type="number" min="0" className="form-control" placeholder={total.toFixed(2)} value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
              {paidAmount && <div className="form-text">Change due: <strong>{formatCurrency(change)}</strong></div>}
            </div>

            <button className="btn btn-success w-100 btn-lg" disabled={submitting || cart.length === 0} onClick={handleCheckout}>
              {submitting ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>

      {receipt && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header"><h5 className="modal-title">Sale Completed</h5>
                <button className="btn-close" onClick={() => setReceipt(null)} /></div>
              <div className="modal-body" id="receipt-print">
                <div className="text-center mb-3">
                  <h4>ELECTRO</h4>
                  <div className="small text-muted">Invoice: {receipt.invoice?.invoice_no}</div>
                  <div className="small text-muted">Order: {receipt.order_no}</div>
                </div>
                <table className="table table-sm">
                  <tbody>
                    {receipt.items.map((i) => (
                      <tr key={i.id}><td>{i.product_name} x{i.quantity}</td><td className="text-end">{formatCurrency(i.subtotal)}</td></tr>
                    ))}
                  </tbody>
                </table>
                <div className="d-flex justify-content-between"><span>Subtotal</span><span>{formatCurrency(receipt.subtotal)}</span></div>
                <div className="d-flex justify-content-between"><span>Tax</span><span>{formatCurrency(receipt.tax)}</span></div>
                <div className="d-flex justify-content-between"><span>Discount</span><span>-{formatCurrency(receipt.discount)}</span></div>
                <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>{formatCurrency(receipt.total)}</span></div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setReceipt(null)}>Close</button>
                <button className="btn btn-primary" onClick={() => window.print()}><FaPrint className="me-1" />Print Invoice</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
