import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatCurrency, imageUrl } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

const emptyForm = {
  name: "", sku: "", barcode: "", category_id: "", brand_id: "", description: "",
  specification: "", cost_price: "", price: "", discount_price: "", tax_rate: 5,
  stock_qty: "", alert_qty: 5, unit: "pcs", is_featured: false, status: "active", thumbnail: null,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const loadProducts = (page = 1, q = "") => {
    setLoading(true);
    api.get("/admin/products", { params: { page, q } })
      .then((res) => { setProducts(res.data.data); setMeta(res.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    api.get("/categories", { params: { all: 1 } }).then((res) => setCategories(res.data));
    api.get("/brands").then((res) => setBrands(res.data));
  }, []);


  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setShowModal(true);
    api.get("/admin/products/next-codes").then((res) => {
      setForm({ ...emptyForm, sku: res.data.sku, barcode: res.data.barcode });
    });
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...emptyForm, ...p, category_id: p.category_id, brand_id: p.brand_id ?? "", thumbnail: null });
    setErrors({});
    setShowModal(true);
  };

  const handleFileChange = (e) => setForm({ ...form, thumbnail: e.target.files[0] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "thumbnail") {
        if (value instanceof File) fd.append(key, value);
        return;
      }
      if (value === null || value === undefined || value === "") return;
      if (key === "is_featured") { fd.append(key, value ? 1 : 0); return; }
      fd.append(key, value);
    });

    try {
      if (editing) {
        await api.post(`/admin/products/${editing.id}`, fd);
        toast.success("Product updated");
      } else {
        await api.post("/admin/products", fd);
        toast.success("Product created");
      }
      setShowModal(false);
      loadProducts();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${product.id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Products</h3>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus className="me-1" /> Add Product</button>
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <input className="form-control" placeholder="Search products..." value={search}
            onChange={(e) => { setSearch(e.target.value); loadProducts(1, e.target.value); }} />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr><th></th><th>Name</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><img src={imageUrl(p.thumbnail)} width={40} height={40} style={{ objectFit: "contain" }} alt="" /></td>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td>{p.category?.name}</td>
                    <td>{formatCurrency(p.price)}</td>
                    <td className={p.stock_qty <= p.alert_qty ? "text-danger fw-bold" : ""}>{p.stock_qty}</td>
                    <td><span className={`badge bg-${p.status === "active" ? "success" : "secondary"}`}>{p.status}</span></td>
                    <td>
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p)}><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {meta.last_page > 1 && (
        <nav className="mt-3">
          <ul className="pagination">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <li key={p} className={`page-item ${p === meta.current_page && "active"}`}>
                <button className="page-link" onClick={() => loadProducts(p, search)}>{p}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg" style={{ maxHeight: "90vh", margin: "5vh auto" }}>
            <div className="modal-content" style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "90vh" }}>
                <div className="modal-header" style={{ flexShrink: 0 }}>
                  <h5 className="modal-title">{editing ? "Edit Product" : "Add Product"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body" style={{ overflowY: "auto", flexGrow: 1 }}>
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label">Product Name</label>
                      <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <div className="text-danger small">{errors.name[0]}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Thumbnail</label>
                      <input type="file" accept="image/*" className="form-control" onChange={handleFileChange} />
                      {errors.thumbnail && <div className="text-danger small">{errors.thumbnail[0]}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">SKU</label>
                      <input className="form-control" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                      {errors.sku && <div className="text-danger small">{errors.sku[0]}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Barcode</label>
                      <input className="form-control" value={form.barcode ?? ""} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unit</label>
                      <input className="form-control" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Category</label>
                      <select className="form-select" required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                        <option value="">Select category</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      {errors.category_id && <div className="text-danger small">{errors.category_id[0]}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Brand</label>
                      <select className="form-select" value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })}>
                        <option value="">Select brand</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Cost Price</label>
                      <input type="number" step="0.01" className="form-control" required value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Selling Price</label>
                      <input type="number" step="0.01" className="form-control" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Discount Price</label>
                      <input type="number" step="0.01" className="form-control" value={form.discount_price ?? ""} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Tax Rate (%)</label>
                      <input type="number" step="0.01" className="form-control" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
                    </div>
                    {!editing && (
                      <div className="col-md-3">
                        <label className="form-label">Opening Stock</label>
                        <input type="number" className="form-control" required value={form.stock_qty} onChange={(e) => setForm({ ...form, stock_qty: e.target.value })} />
                      </div>
                    )}
                    <div className="col-md-3">
                      <label className="form-label">Alert Qty</label>
                      <input type="number" className="form-control" value={form.alert_qty} onChange={(e) => setForm({ ...form, alert_qty: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Status</label>
                      <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-3 d-flex align-items-end">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />
                        <label className="form-check-label">Featured Product</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" rows={3} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Specification</label>
                      <textarea className="form-control" rows={2} value={form.specification ?? ""} onChange={(e) => setForm({ ...form, specification: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{ flexShrink: 0 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Product"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
