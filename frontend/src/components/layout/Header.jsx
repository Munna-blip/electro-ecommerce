import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart, FaHeart, FaUser, FaSearch, FaBars } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

export default function Header() {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isStaff, loading } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky-top glass-header shadow-sm">
      <div className="bg-dark text-white py-1">
        <div className="container d-flex justify-content-between small">
          <span>Free delivery on orders over ৳5,000</span>
          <span>Call us: 09666-777-999</span>
        </div>
      </div>
      <div className="container py-3">
        <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <Link to="/" className="navbar-brand fw-bold fs-3 text-primary text-decoration-none">
            ELECTRO
          </Link>

          <form onSubmit={handleSearch} className="flex-grow-1 mx-md-4" style={{ maxWidth: 560 }}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search for products, brands and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <FaSearch />
              </button>
            </div>
          </form>

          <div className="d-flex align-items-center gap-3">
            <Link to="/wishlist" className="text-dark text-decoration-none text-center">
              <FaHeart size={20} />
              <div className="small">Wishlist</div>
            </Link>
            <Link to="/cart" className="text-dark text-decoration-none text-center position-relative">
              <FaShoppingCart size={20} />
              {itemCount > 0 && (
                <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">
                  {itemCount}
                </span>
              )}
              <div className="small">Cart</div>
            </Link>

            {loading ? (
              <div style={{ width: 90, height: 38 }} />
            ) : user ? (
              <div className="dropdown">
                <button
                  className="btn btn-light d-flex align-items-center gap-1"
                  data-bs-toggle="dropdown"
                >
                  <FaUser /> {user.name.split(" ")[0]}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/profile">My Profile</Link></li>
                  <li><Link className="dropdown-item" to="/orders">My Orders</Link></li>
                  {isStaff && <li><Link className="dropdown-item" to="/admin">Admin Dashboard</Link></li>}
                  <li><hr className="dropdown-divider" /></li>
                  <li><button className="dropdown-item" onClick={logout}>Logout</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-outline-primary">
                <FaUser className="me-1" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <nav className="navbar navbar-expand-lg bg-primary">
        <div className="container">
          <button className="navbar-toggler text-white border-0" onClick={() => setMenuOpen(!menuOpen)}>
            <FaBars className="text-white" />
          </button>
          <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
            <ul className="navbar-nav gap-3 py-2">
              <li className="nav-item"><Link className="nav-link text-white" to="/">Home</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="/shop">Shop All</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="/shop?featured=1">Featured</Link></li>
              <li className="nav-item"><Link className="nav-link text-white" to="/orders">Track Order</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
