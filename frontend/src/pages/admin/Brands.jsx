import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const empty = { name: "", is_active: true, logo: null };

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => { setLoading(true); api.get("/brands").then((res) => setBrands(res.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...empty, ...b, logo: null }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, k === "is_active" ? (v ? 1 : 0) : v); });
    try {
     if (editing) { await api.post(`/admin/brands/${editing.id}`, fd); toast.success("Brand updated"); }
      else { await api.post("/admin/brands", fd); toast.success("Brand created"); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete "${b.name}"?`)) return;
    await api.delete(`/admin/brands/${b.id}`);
    toast.success("Brand deleted"); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Brands</h3>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus className="me-1" />Add Brand</button>
      </div>
      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Name</th><th>Products</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.products_count}</td>
                <td><span className={`badge bg-${b.is_active ? "success" : "secondary"}`}>{b.is_active ? "Active" : "Inactive"}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(b)}><FaEdit /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(b)}><FaTrash /></button>
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
                <div className="modal-header"><h5 className="modal-title">{editing ? "Edit" : "Add"} Brand</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} /></div>
                <div className="modal-body">
                  <div className="mb-3"><label className="form-label">Name</label>
                    <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="mb-3"><label className="form-label">Logo</label>
                    <input type="file" accept="image/*" className="form-control" onChange={(e) => setForm({ ...form, logo: e.target.files[0] })} /></div>
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
