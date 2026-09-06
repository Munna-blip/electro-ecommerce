import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-md-3">
            <h5 className="text-primary fw-bold">ELECTRO</h5>
            <p className="text-secondary small">
              Your trusted destination for laptops, components, gadgets and accessories in Bangladesh.
            </p>
          </div>
          <div className="col-md-3">
            <h6>Shop</h6>
            <ul className="list-unstyled small">
              <li><Link className="text-secondary text-decoration-none" to="/shop">All Products</Link></li>
              <li><Link className="text-secondary text-decoration-none" to="/shop?featured=1">Featured</Link></li>
              <li><Link className="text-secondary text-decoration-none" to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6>Account</h6>
            <ul className="list-unstyled small">
              <li><Link className="text-secondary text-decoration-none" to="/login">Login</Link></li>
              <li><Link className="text-secondary text-decoration-none" to="/register">Register</Link></li>
              <li><Link className="text-secondary text-decoration-none" to="/orders">Order History</Link></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h6>Contact</h6>
            <ul className="list-unstyled small text-secondary">
              <li>House 12, Road 5, Dhaka, Bangladesh</li>
              <li>+880 9666-777-999</li>
              <li>support@electro.test</li>
            </ul>
          </div>
        </div>
        <hr className="border-secondary" />
        <p className="text-center text-secondary small mb-0">© {new Date().getFullYear()} Electro. All rights reserved.</p>
      </div>
    </footer>
  );
}
