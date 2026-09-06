import { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = (q = "") => {
    setLoading(true);
    api.get("/admin/customers", { params: { q } }).then((res) => setCustomers(res.data.data)).finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const toggleActive = async (c) => {
    try {
      await api.put(`/admin/customers/${c.id}`, { is_active: !c.is_active });
      toast.success("Customer updated");
      load(search);
    } catch (e) { toast.error("Update failed"); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-4">Customers</h3>
      <div className="card shadow-sm mb-3"><div className="card-body">
        <input className="form-control" placeholder="Search customers..." value={search}
          onChange={(e) => { setSearch(e.target.value); load(e.target.value); }} />
      </div></div>
      <div className="card shadow-sm">
        <table className="table mb-0 align-middle">
          <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td>{c.orders_count}</td>
                <td><span className={`badge bg-${c.is_active ? "success" : "secondary"}`}>{c.is_active ? "Active" : "Disabled"}</span></td>
                <td><button className="btn btn-sm btn-outline-secondary" onClick={() => toggleActive(c)}>
                  {c.is_active ? "Disable" : "Enable"}
                </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
