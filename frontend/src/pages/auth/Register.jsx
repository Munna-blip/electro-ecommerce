import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaBolt,
  FaLaptop, FaMobileAlt, FaHeadphones, FaCamera, FaKeyboard,
  FaMouse, FaTv, FaMicrochip, FaWifi,
} from "react-icons/fa";

const floatingIcons = [
  { Icon: FaLaptop, top: "8%", left: "8%", size: 70, delay: "0s" },
  { Icon: FaMobileAlt, top: "72%", left: "6%", size: 46, delay: "1.2s" },
  { Icon: FaHeadphones, top: "12%", left: "85%", size: 60, delay: "0.6s" },
  { Icon: FaCamera, top: "80%", left: "88%", size: 54, delay: "2s" },
  { Icon: FaKeyboard, top: "45%", left: "3%", size: 50, delay: "1.6s" },
  { Icon: FaMouse, top: "90%", left: "40%", size: 40, delay: "0.9s" },
  { Icon: FaTv, top: "5%", left: "45%", size: 56, delay: "2.4s" },
  { Icon: FaMicrochip, top: "55%", left: "92%", size: 48, delay: "1.4s" },
  { Icon: FaWifi, top: "32%", left: "20%", size: 38, delay: "0.3s" },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: [err.response?.data?.message || "Registration failed"] });
    } finally {
      setSubmitting(false);
    }
  };

  const fields = [
    { key: "name", label: "Full Name", icon: FaUser, type: "text", required: true },
    { key: "email", label: "Email Address", icon: FaEnvelope, type: "email", required: true },
    { key: "phone", label: "Phone Number", icon: FaPhone, type: "text", required: false },
    { key: "address", label: "Address", icon: FaMapMarkerAlt, type: "text", required: false },
  ];

  return (
    <div className="auth-page d-flex align-items-center justify-content-center p-3 py-5">
      {floatingIcons.map(({ Icon, top, left, size, delay }, i) => (
        <Icon
          key={i}
          className="auth-floating-icon"
          style={{ top, left, fontSize: size, animationDelay: delay }}
        />
      ))}

      <div className="auth-card-wrap w-100" style={{ maxWidth: 460 }}>
        <div className="text-center mb-4">
          <Link to="/" className="auth-brand-logo text-white text-decoration-none fs-3">
            <FaBolt /> ELECTRO
          </Link>
        </div>

        <div className="auth-glass-card p-4 p-md-5">
          <h3 className="fw-bold mb-1">Create Account</h3>
          <p className="text-muted mb-4">Sign up to get started with Electro</p>

          {errors.general && <div className="alert alert-danger py-2">{errors.general[0]}</div>}

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, label, icon: Icon, type, required }) => (
              <div className="mb-3" key={key}>
                <label className="form-label small fw-semibold">{label}</label>
                <div className="input-group auth-input-group">
                  <span className="input-group-text bg-white border-end-0"><Icon className="text-muted" /></span>
                  <input
                    type={type}
                    className="form-control py-2 border-start-0"
                    required={required}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                </div>
                {errors[key] && <div className="text-danger small mt-1">{errors[key][0]}</div>}
              </div>
            ))}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text bg-white border-end-0"><FaLock className="text-muted" /></span>
                <input
                  type="password"
                  className="form-control py-2 border-start-0"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
              {errors.password && <div className="text-danger small mt-1">{errors.password[0]}</div>}
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Confirm Password</label>
              <div className="input-group auth-input-group">
                <span className="input-group-text bg-white border-end-0"><FaLock className="text-muted" /></span>
                <input
                  type="password"
                  className="form-control py-2 border-start-0"
                  required
                  value={form.password_confirmation}
                  onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn auth-submit-btn text-white w-100 py-2 fw-semibold" disabled={submitting}>
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Already have an account? <Link to="/login" className="fw-semibold text-decoration-none">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}