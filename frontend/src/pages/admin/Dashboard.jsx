import { useEffect, useState } from "react";
import api from "../../api/axios";
import { formatCurrency } from "../../utils/format";
import LoadingSpinner from "../../components/LoadingSpinner";
import AnimatedNumber from "../../components/admin/AnimatedNumber";
import {
  FaDollarSign, FaShoppingCart, FaBoxOpen, FaUsers, FaExclamationTriangle, FaCalendarDay, FaChartLine,
} from "react-icons/fa";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from "recharts";

function StatCard({ icon: Icon, label, value, isCurrency, color, gradient, delayClass, alert }) {
  return (
    <div className="col-md-3 col-6">
      <div className={`card shadow-sm h-100 dash-card ${delayClass} ${alert ? "alert-card" : ""}`}>
        <div className="card-body d-flex align-items-center gap-3">
          <div className="icon-wrap" style={{ background: gradient }}>
            <Icon className="text-white" size={22} />
          </div>
          <div>
            <div className="text-muted small">{label}</div>
            <div className="fs-4 fw-bold" style={{ color }}>
              {isCurrency ? (
                <AnimatedNumber value={value} prefix="৳" />
              ) : (
                <AnimatedNumber value={value} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard/stats").then((res) => setStats(res.data));
  }, []);

  if (!stats) return <LoadingSpinner label="Loading dashboard..." />;

  return (
    <div>
      <div className="mb-4" style={{ animation: "fadeSlideUp 0.4s ease both" }}>
        <h3 className="mb-1 fw-bold">Dashboard</h3>
        <p className="text-muted mb-0">Welcome back — here's what's happening in your store today.</p>
      </div>

      <div className="row g-3 mb-3">
        <StatCard
          icon={FaDollarSign} label="Total Sales" value={stats.total_sales} isCurrency
          color="#198754" gradient="linear-gradient(135deg,#20c997,#198754)" delayClass="dash-fade-1"
        />
        <StatCard
          icon={FaShoppingCart} label="Total Orders" value={stats.total_orders}
          color="#0d6efd" gradient="linear-gradient(135deg,#4dabf7,#0d6efd)" delayClass="dash-fade-2"
        />
        <StatCard
          icon={FaBoxOpen} label="Total Products" value={stats.total_products}
          color="#0dcaf0" gradient="linear-gradient(135deg,#66d9e8,#0dcaf0)" delayClass="dash-fade-3"
        />
        <StatCard
          icon={FaUsers} label="Customers" value={stats.total_customers}
          color="#6c757d" gradient="linear-gradient(135deg,#adb5bd,#6c757d)" delayClass="dash-fade-4"
        />
      </div>

      <div className="row g-3 mb-4">
        <StatCard
          icon={FaCalendarDay} label="Today's Sales" value={stats.today_sales} isCurrency
          color="#198754" gradient="linear-gradient(135deg,#20c997,#198754)" delayClass="dash-fade-5"
        />
        <StatCard
          icon={FaChartLine} label="This Month" value={stats.month_sales} isCurrency
          color="#6610f2" gradient="linear-gradient(135deg,#b197fc,#6610f2)" delayClass="dash-fade-6"
        />
        <StatCard
          icon={FaShoppingCart} label="Pending Orders" value={stats.pending_orders}
          color="#fd7e14" gradient="linear-gradient(135deg,#ffb060,#fd7e14)" delayClass="dash-fade-7"
        />
        <StatCard
          icon={FaExclamationTriangle} label="Low Stock Items" value={stats.low_stock_count}
          color="#dc3545" gradient="linear-gradient(135deg,#ff6b6b,#dc3545)" delayClass="dash-fade-8"
          alert={stats.low_stock_count > 0}
        />
      </div>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card shadow-sm dash-panel" style={{ animationDelay: "0.25s" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3">Sales — Last 7 Days</h6>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={stats.sales_last_7_days}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  />
                  <Area
                    type="monotone" dataKey="total" stroke="#0d6efd" strokeWidth={3}
                    fill="url(#salesGradient)" animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm h-100 dash-panel" style={{ animationDelay: "0.3s" }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3">Top Selling Products</h6>
              {stats.top_products.length === 0 ? (
                <p className="text-muted small">No sales data yet.</p>
              ) : (
                stats.top_products.map((p, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center border-bottom py-2 small top-product-row px-2">
                    <span className="d-flex align-items-center gap-2">
                      <span
                        className="badge rounded-pill"
                        style={{ background: i === 0 ? "#ffd43b" : i === 1 ? "#ced4da" : i === 2 ? "#e8a86c" : "#e9ecef", color: "#333" }}
                      >
                        #{i + 1}
                      </span>
                      {p.product_name}
                    </span>
                    <span className="fw-semibold">{p.total_qty} sold</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-4 dash-panel" style={{ animationDelay: "0.35s" }}>
        <div className="card-body">
          <h6 className="fw-bold mb-3">Recent Orders</h6>
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <thead>
                <tr className="text-muted small">
                  <th>Order No</th><th>Customer</th><th>Channel</th><th>Total</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((o) => (
                  <tr key={o.id} className="recent-order-row">
                    <td className="fw-semibold">{o.order_no}</td>
                    <td>{o.user?.name ?? "Walk-in"}</td>
                    <td className="text-uppercase small">{o.channel}</td>
                    <td>{formatCurrency(o.total)}</td>
                    <td>
                      <span className={`badge text-capitalize bg-${
                        o.status === "completed" ? "success" :
                        o.status === "cancelled" ? "danger" :
                        o.status === "pending" ? "warning" : "primary"
                      }`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}