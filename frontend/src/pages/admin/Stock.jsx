import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Stock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowOnly, setLowOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: "", quantity: "", note: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = (low = lowOnly, q = search) => {
    setLoading(true);
    api.get("/admin/stock", { params: { low_stock: low ? 1 : undefined, q } })
      .then((res) => setStock(res.data.data))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/stock/adjust", form);
      toast.success("Stock adjusted");
      setShowModal(false);
      setForm({ product_id: "", quantity: "", note: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Stock / Inventory</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Adjust Stock</button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body d-flex gap-3">
          <input className="form-control" placeholder="Search product / SKU / barcode..." value={search}
            onChange={(e) => { setSearch(e.target.value); load(lowOnly, e.target.value); }} />
          <div className="form-check text-nowrap">
            <input className="form-check-input" type="checkbox" checked={lowOnly}
              onChange={(e) => { setLowOnly(e.target.checked); load(e.target.checked, search); }} />
            <label className="form-check-label">Low stock only</label>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Product</th><th>SKU</th><th>Barcode</th><th>Stock</th><th>Alert Level</th><th>Status</th></tr></thead>
          <tbody>
            {stock.map((p) => (
              <tr key={p.id} className={p.stock_qty <= p.alert_qty ? "table-danger" : ""}>
                <td>{p.name}</td><td>{p.sku}</td><td>{p.barcode}</td>
                <td className="fw-bold">{p.stock_qty} {p.unit}</td><td>{p.alert_qty}</td>
                <td>{p.stock_qty <= p.alert_qty ? <span className="badge bg-danger">Low Stock</span> : <span className="badge bg-success">OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAdjust}>
                <div className="modal-header"><h5 className="modal-title">Adjust Stock</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} /></div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Product</label>
                    <select className="form-select" required value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })}>
                      <option value="">Select product</option>
                      {stock.map((p) => <option key={p.id} value={p.id}>{p.name} (current: {p.stock_qty})</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Quantity Change</label>
                    <input type="number" className="form-control" required placeholder="e.g. 10 or -5"
                      value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
                    <div className="form-text">Use a positive number to add stock, negative to remove (e.g. damage/loss).</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Note</label>
                    <input className="form-control" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Apply Adjustment"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
