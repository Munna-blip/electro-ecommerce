import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";

const empty = { name: "", company: "", email: "", phone: "", address: "", is_active: true };

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [submitting, setSubmitting] = useState(false);

  const load = () => { setLoading(true); api.get("/admin/suppliers").then((res) => setSuppliers(res.data.data)).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...empty, ...s }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) { await api.put(`/admin/suppliers/${editing.id}`, form); toast.success("Supplier updated"); }
      else { await api.post("/admin/suppliers", form); toast.success("Supplier created"); }
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete "${s.name}"?`)) return;
    await api.delete(`/admin/suppliers/${s.id}`);
    toast.success("Supplier deleted"); load();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0">Suppliers</h3>
        <button className="btn btn-primary" onClick={openCreate}><FaPlus className="me-1" />Add Supplier</button>
      </div>
      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Name</th><th>Company</th><th>Phone</th><th>Email</th><th></th></tr></thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td><td>{s.company}</td><td>{s.phone}</td><td>{s.email}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(s)}><FaEdit /></button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s)}><FaTrash /></button>
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
                <div className="modal-header"><h5 className="modal-title">{editing ? "Edit" : "Add"} Supplier</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} /></div>
                <div className="modal-body">
                  {["name", "company", "email", "phone", "address"].map((f) => (
                    <div className="mb-3" key={f}>
                      <label className="form-label text-capitalize">{f}</label>
                      <input className="form-control" value={form[f] ?? ""} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f === "name"} />
                    </div>
                  ))}
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
