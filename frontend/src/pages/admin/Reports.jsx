import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Reports() {
  const [from, setFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/reports/sales", { params: { from, to } }),
      api.get("/admin/reports/stock"),
    ]).then(([s, st]) => { setSales(s.data); setStock(st.data); }).finally(() => setLoading(false));
  };
  useEffect(load, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="mb-4">Reports</h3>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold">Sales Report</h6>
          <div className="row g-2 mb-3">
            <div className="col-auto"><input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div className="col-auto"><input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            <div className="col-auto"><button className="btn btn-primary" onClick={load}>Apply</button></div>
          </div>

          <div className="row g-3 mb-4">
            {[
              ["Total Orders", sales.summary.total_orders],
              ["Total Revenue", formatCurrency(sales.summary.total_revenue)],
              ["Total Tax", formatCurrency(sales.summary.total_tax)],
              ["Online / POS", `${sales.summary.online_orders} / ${sales.summary.pos_orders}`],
            ].map(([label, value]) => (
              <div className="col-md-3" key={label}>
                <div className="border rounded p-3 text-center">
                  <div className="text-muted small">{label}</div>
                  <div className="fs-5 fw-bold">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sales.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(v) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#0d6efd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="fw-bold">Stock Report</h6>
          <div className="mb-3">Total Stock Value: <strong>{formatCurrency(stock.total_stock_value)}</strong></div>
          <h6 className="text-danger small">Low Stock Items ({stock.low_stock_items.length})</h6>
          <table className="table table-sm">
            <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Alert Qty</th></tr></thead>
            <tbody>
              {stock.low_stock_items.map((p) => (
                <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td className="text-danger fw-bold">{p.stock_qty}</td><td>{p.alert_qty}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
