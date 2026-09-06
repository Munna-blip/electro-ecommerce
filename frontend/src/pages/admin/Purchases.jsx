import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-toastify";
import { FaPlus, FaCheckCircle } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ supplier_id: "", purchase_date: new Date().toISOString().slice(0, 10), status: "received", note: "" });
  const [items, setItems] = useState([{ product_id: "", quantity: 1, unit_cost: "" }]);

  const load = () => {
    setLoading(true);
    api.get("/admin/purchases").then((res) => setPurchases(res.data.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    api.get("/admin/suppliers").then((res) => setSuppliers(res.data.data));
    api.get("/admin/products", { params: { per_page: 100 } }).then((res) => setProducts(res.data.data));
  }, []);

  const addItemRow = () => setItems([...items, { product_id: "", quantity: 1, unit_cost: "" }]);
  const removeItemRow = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const total = items.reduce((sum, i) => sum + (Number(i.quantity) || 0) * (Number(i.unit_cost) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/purchases", { ...form, items });
      toast.success("Purchase recorded and stock updated");
      setShowModal(false);
      setItems([{ product_id: "", quantity: 1, unit_cost: "" }]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save purchase");
    } finally {
      setSubmitting(false);
    }
  };

  const markReceived = async (p) => {
    try {
      await api.post(`/admin/purchases/${p.id}/receive`);
      toast.success("Purchase marked as received — stock updated");
      load();
    } catch (err) { toast.error("Failed to update purchase"); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Purchases</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><FaPlus className="me-1" />New Purchase</button>
      </div>

      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Reference</th><th>Supplier</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id}>
                <td>{p.reference_no}</td><td>{p.supplier?.name}</td><td>{p.purchase_date}</td>
                <td>{p.items.length}</td><td>{formatCurrency(p.total_amount)}</td>
                <td><span className={`badge bg-${p.status === "received" ? "success" : p.status === "cancelled" ? "danger" : "warning"}`}>{p.status}</span></td>
                <td>{p.status === "pending" && (
                  <button className="btn btn-sm btn-outline-success" onClick={() => markReceived(p)}><FaCheckCircle className="me-1" />Receive</button>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header"><h5 className="modal-title">New Purchase</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} /></div>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-5">
                      <label className="form-label">Supplier</label>
                      <select className="form-select" required value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}>
                        <option value="">Select supplier</option>
                        {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Purchase Date</label>
                      <input type="date" className="form-control" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="received">Received (adds stock now)</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  <h6>Items</h6>
                  {items.map((item, i) => (
                    <div className="row g-2 mb-2 align-items-center" key={i}>
                      <div className="col-5">
                        <select className="form-select" required value={item.product_id} onChange={(e) => updateItem(i, "product_id", e.target.value)}>
                          <option value="">Select product</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="col-3">
                        <input type="number" min="1" className="form-control" placeholder="Qty" required
                          value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} />
                      </div>
                      <div className="col-3">
                        <input type="number" step="0.01" min="0" className="form-control" placeholder="Unit Cost" required
                          value={item.unit_cost} onChange={(e) => updateItem(i, "unit_cost", e.target.value)} />
                      </div>
                      <div className="col-1">
                        {items.length > 1 && <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItemRow(i)}>×</button>}
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={addItemRow}>+ Add Item</button>

                  <div className="text-end fw-bold mt-3 fs-5">Total: {formatCurrency(total)}</div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Purchase"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
