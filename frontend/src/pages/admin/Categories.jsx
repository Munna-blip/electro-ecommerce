import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const empty = { name: "", parent_id: "", is_active: true, image: null };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    api.get("/categories", { params: { all: 1 } }).then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(empty); setErrors({}); setShowModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...empty, ...c, image: null }); setErrors({}); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, k === "is_active" ? (v ? 1 : 0) : v); });
    try {
     if (editing) { await api.post(`/admin/categories/${editing.id}`, fd); toast.success("Category updated"); }
      else { await api.post("/admin/categories", fd); toast.success("Category created"); }
      setShowModal(false); load();
    } catch (err) {
      if (err.response?.status === 422) setErrors(err.response.data.errors || {});
      toast.error(err.response?.data?.message || "Save failed");
    }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    await api.delete(`/admin/categories/${c.id}`);
    toast.success("Category deleted"); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Categories</h3>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus className="me-1" />Add Category</button>
      </div>
      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Name</th><th>Products</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.products_count}</td>
                <td><span className={`badge bg-${c.is_active ? "success" : "secondary"}`}>{c.is_active ? "Active" : "Inactive"}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}><FaEdit /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header"><h5 className="modal-title">{editing ? "Edit" : "Add"} Category</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} /></div>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Name</label>
                    <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    {errors.name && <div className="text-danger small">{errors.name[0]}</div>}</div>
                  <div className="mb-3"><label className="form-label">Parent Category</label>
                    <select className="form-select" value={form.parent_id ?? ""} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
                      <option value="">None</option>
                      {categories.filter((c) => c.id !== editing?.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select></div>
                  <div className="mb-3"><label className="form-label">Image</label>
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
                    {errors.image && <div className="text-danger small">{errors.image[0]}</div>}</div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
