import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBolt,
  FaLaptop, FaMobileAlt, FaHeadphones, FaCamera, FaKeyboard,
  FaMouse, FaTv, FaMicrochip, FaWifi,
} from "react-icons/fa";

const floatingIcons = [
  { Icon: FaLaptop, top: "8%", left: "8%", size: 70, delay: "0s" },
  { Icon: FaMobileAlt, top: "70%", left: "6%", size: 46, delay: "1.2s" },
  { Icon: FaHeadphones, top: "15%", left: "85%", size: 60, delay: "0.6s" },
  { Icon: FaCamera, top: "78%", left: "88%", size: 54, delay: "2s" },
  { Icon: FaKeyboard, top: "42%", left: "3%", size: 50, delay: "1.6s" },
  { Icon: FaMouse, top: "88%", left: "40%", size: 40, delay: "0.9s" },
  { Icon: FaTv, top: "5%", left: "45%", size: 56, delay: "2.4s" },
  { Icon: FaMicrochip, top: "50%", left: "92%", size: 48, delay: "1.4s" },
  { Icon: FaWifi, top: "30%", left: "20%", size: 38, delay: "0.3s" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(form.email, form.password);
      const redirectTo = location.state?.from || (user.role !== "customer" ? "/admin" : "/");
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center p-3">
      {floatingIcons.map(({ Icon, top, left, size, delay }, i) => (
        <Icon
          key={i}
          className="auth-floating-icon"
          style={{ top, left, fontSize: size, animationDelay: delay }}
        />
      ))}

      <div className="auth-card-wrap w-100" style={{ maxWidth: 420 }}>
        <div className="text-center mb-4">
          <Link to="/" className="auth-brand-logo text-white text-decoration-none fs-3">
            <FaBolt /> ELECTRO
          </Link>
        </div>

        <div className="auth-glass-card p-4 p-md-5">
          <h3 className="fw-bold mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to continue to your account</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email Address</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text bg-white border-end-0"><FaEnvelope className="text-muted" /></span>
                <input
                  type="email"
                  className="form-control py-2 border-start-0"
                  placeholder="you@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text bg-white border-end-0"><FaLock className="text-muted" /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control py-2 border-start-0 border-end-0"
                  placeholder="••••••••"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  className="input-group-text bg-white border-start-0"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn auth-submit-btn text-white w-100 py-2 fw-semibold" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Don't have an account? <Link to="/register" className="fw-semibold text-decoration-none">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}