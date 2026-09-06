import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatCurrency } from "../utils/format";
import LoadingSpinner from "../components/LoadingSpinner";

const statusColors = { pending: "warning", processing: "info", shipped: "primary", completed: "success", cancelled: "danger" };

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/orders/my").then((res) => setOrders(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <h4 className="mb-4">My Orders</h4>
      {orders.length === 0 ? (
        <div className="text-center py-5 text-muted">You have not placed any orders yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle bg-white shadow-sm">
            <thead>
              <tr><th>Order No</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="fw-semibold">{o.order_no}</td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>{o.items.length} item(s)</td>
                  <td>{formatCurrency(o.total)}</td>
                  <td><span className={`badge bg-${statusColors[o.status]}`}>{o.status}</span></td>
                  <td><span className={`badge bg-${o.payment_status === "paid" ? "success" : "secondary"}`}>{o.payment_status}</span></td>
                  <td><Link to={`/orders/${o.id}`} className="btn btn-sm btn-outline-primary">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
