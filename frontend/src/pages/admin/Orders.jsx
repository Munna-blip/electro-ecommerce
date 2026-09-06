import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/LoadingSpinner";

const statuses = ["pending", "processing", "shipped", "completed", "cancelled"];
const paymentStatuses = ["unpaid", "paid", "partial", "refunded"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", payment_status: "", channel: "", q: "" });

  const load = (page = 1, f = filters) => {
    setLoading(true);
    api.get("/admin/orders", { params: { page, ...f } }).then((res) => { setOrders(res.data.data); setMeta(res.data); }).finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const updateFilter = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    load(1, next);
  };

  const updateStatus = async (order, field, value) => {
    try {
      await api.put(`/admin/orders/${order.id}/status`, { [field]: value });
      toast.success("Order updated");
      load(meta.current_page);
    } catch (err) { toast.error("Update failed"); }
  };

  return (
    <div>
      <h3 className="mb-4">Orders</h3>
      <div className="card shadow-sm mb-3">
        <div className="card-body row g-2">
          <div className="col-md-3">
            <input className="form-control" placeholder="Search order no..." value={filters.q} onChange={(e) => updateFilter("q", e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filters.status} onChange={(e) => updateFilter("status", e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filters.payment_status} onChange={(e) => updateFilter("payment_status", e.target.value)}>
              <option value="">All Payment Statuses</option>
              {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={filters.channel} onChange={(e) => updateFilter("channel", e.target.value)}>
              <option value="">All Channels</option>
              <option value="online">Online</option>
              <option value="pos">POS</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light"><tr><th>Order No</th><th>Customer</th><th>Channel</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead>
              <tbody>
                {orders.map((o) => {
                  let rowClass = "";
                  if (o.status === "completed") rowClass = "table-success";
                  else if (o.status === "cancelled") rowClass = "table-danger";
                  else if (o.payment_status === "paid") rowClass = "table-success";
                  else if (o.payment_status === "unpaid") rowClass = "table-danger";

                  return (
                    <tr key={o.id} className={rowClass}>
                      <td>{o.order_no}</td>
                      <td>{o.user?.name ?? "Walk-in Customer"}</td>
                      <td className="text-uppercase small">{o.channel}</td>
                      <td>{formatCurrency(o.total)}</td>
                      <td>
                        <select className="form-select form-select-sm" value={o.status} onChange={(e) => updateStatus(o, "status", e.target.value)}>
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-select form-select-sm" value={o.payment_status} onChange={(e) => updateStatus(o, "payment_status", e.target.value)}>
                          {paymentStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
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
                <button className="page-link" onClick={() => load(p)}>{p}</button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
