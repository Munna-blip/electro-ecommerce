import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaTachometerAlt, FaBoxOpen, FaTags, FaCopyright, FaTruck, FaUsers,
  FaShoppingBag, FaWarehouse, FaCashRegister, FaChartBar, FaSignOutAlt, FaHome,
} from "react-icons/fa";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: FaTachometerAlt, exact: true },
  { to: "/admin/pos", label: "POS", icon: FaCashRegister },
  { to: "/admin/products", label: "Products", icon: FaBoxOpen },
  { to: "/admin/categories", label: "Categories", icon: FaTags },
  { to: "/admin/brands", label: "Brands", icon: FaCopyright },
  { to: "/admin/suppliers", label: "Suppliers", icon: FaTruck },
  { to: "/admin/customers", label: "Customers", icon: FaUsers },
  { to: "/admin/purchases", label: "Purchases", icon: FaShoppingBag },
  { to: "/admin/stock", label: "Stock / Inventory", icon: FaWarehouse },
  { to: "/admin/orders", label: "Orders", icon: FaShoppingBag },
  { to: "/admin/reports", label: "Reports", icon: FaChartBar },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside className="bg-dark text-white p-3" style={{ width: 250, flexShrink: 0 }}>
        <Link to="/" className="d-flex align-items-center gap-2 text-white text-decoration-none mb-4">
          <FaHome /> <span className="fw-bold fs-5">ELECTRO Admin</span>
        </Link>
        <nav className="nav flex-column gap-1">
          {navItems.map(({ to, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`nav-link d-flex align-items-center gap-2 rounded px-2 py-2 ${active ? "bg-primary text-white" : "text-white-50"}`}
              >
                <Icon /> {label}
              </Link>
            );
          })}
        </nav>
        <hr className="border-secondary" />
        <div className="small text-white-50 mb-2">Signed in as<br /><strong className="text-white">{user?.name}</strong> ({user?.role})</div>
        <button className="btn btn-outline-light btn-sm w-100" onClick={logout}>
          <FaSignOutAlt className="me-1" /> Logout
        </button>
      </aside>
      <main className="flex-grow-1 bg-light p-4" style={{ overflowX: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
