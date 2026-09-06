import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/product/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { imageUrl } from "../utils/format";
import {
  FaLaptop, FaDesktop, FaTv, FaMicrochip, FaWifi,
  FaMobileAlt, FaHeadphones, FaCamera, FaTags,
  FaShippingFast, FaShieldAlt, FaLock, FaUndo, FaArrowRight,
} from "react-icons/fa";

const categoryIcons = {
  "Laptops": FaLaptop, "Laptop": FaLaptop,
  "Desktop PCs": FaDesktop, "Desktop": FaDesktop,
  "Monitors": FaTv, "Monitor": FaTv,
  "Components": FaMicrochip,
  "Networking": FaWifi,
  "Mobile Phones": FaMobileAlt, "Smartphone": FaMobileAlt,
  "Accessories": FaHeadphones, "Headphone": FaHeadphones,
  "Cameras": FaCamera,
};

const trustItems = [
  { icon: FaShippingFast, title: "Fast Delivery", desc: "Dhaka within 24 hours" },
  { icon: FaShieldAlt, title: "Genuine Warranty", desc: "Official manufacturer warranty" },
  { icon: FaLock, title: "Secure Payment", desc: "bKash, Nagad, cards & more" },
  { icon: FaUndo, title: "Easy Returns", desc: "7-day replacement policy" },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products", { params: { featured: 1, per_page: 8 } }),
      api.get("/categories"),
      api.get("/products", { params: { sort: "latest", per_page: 8 } }),
    ])
      .then(([featuredRes, catRes, latestRes]) => {
        setFeatured(featuredRes.data.data);
        setCategories(catRes.data);
        setLatest(latestRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading homepage..." />;

  return (
    <div>
      {/* Hero */}
      <section className="hero-section py-5">
        <div className="container hero-content py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="hero-badge mb-3">
                <FaShieldAlt size={12} /> Trusted electronics retailer in Bangladesh
              </span>
              <h1 className="display-5 fw-bold mt-3 mb-3">
                Everything you need to build, work, and play.
              </h1>
              <p className="fs-5 mb-4" style={{ maxWidth: 520, opacity: 0.85 }}>
                Laptops, components, and gadgets at honest prices — with genuine
                warranty and delivery across Bangladesh.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/shop" className="btn btn-light btn-lg fw-semibold">
                  Browse Products
                </Link>
                <Link to="/shop?featured=1" className="btn btn-outline-light btn-lg">
                  View Deals
                </Link>
              </div>

              <div className="d-flex gap-4 mt-5 flex-wrap">
                <div className="hero-stat">
                  <div className="fs-4 fw-bold">10,000+</div>
                  <div className="small" style={{ opacity: 0.75 }}>Products in stock</div>
                </div>
                <div className="hero-stat">
                  <div className="fs-4 fw-bold">24h</div>
                  <div className="small" style={{ opacity: 0.75 }}>Dhaka delivery</div>
                </div>
                <div className="hero-stat">
                  <div className="fs-4 fw-bold">4.8/5</div>
                  <div className="small" style={{ opacity: 0.75 }}>Customer rating</div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block">
              <div className="p-4 rounded-4" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
                <div className="bg-white rounded-3 p-4 text-dark">
                  <div className="text-muted small mb-1">Featured Deal</div>
                  {featured[0] ? (
                    <>
                      <img
                        src={imageUrl(featured[0].thumbnail)}
                        alt={featured[0].name}
                        style={{ height: 160, objectFit: "contain" }}
                        className="w-100 mb-3"
                      />
                      <div className="fw-semibold text-truncate">{featured[0].name}</div>
                      <div className="text-primary fw-bold fs-5">
                        ৳{Number(featured[0].final_price ?? featured[0].price).toLocaleString()}
                      </div>
                      <Link to={`/product/${featured[0].slug}`} className="btn btn-primary btn-sm mt-2 w-100">
                        Shop This Deal
                      </Link>
                    </>
                  ) : (
                    <div className="text-muted py-5 text-center">No featured product yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="trust-strip py-4">
        <div className="container">
          <div className="row g-4">
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <div className="col-6 col-md-3" key={title}>
                <div className="trust-item">
                  <div className="trust-icon"><Icon size={18} /></div>
                  <div>
                    <div className="fw-semibold small">{title}</div>
                    <div className="text-muted" style={{ fontSize: "0.78rem" }}>{desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="container py-5">
        <h3 className="section-heading mb-4 fw-bold">Shop by Category</h3>
        <div className="row g-3">
          {categories.map((cat) => {
            const Icon = categoryIcons[cat.name] || FaTags;
            return (
              <div className="col-6 col-md-3 col-lg-2" key={cat.id}>
                <Link to={`/shop?category_id=${cat.id}`} className="text-decoration-none text-dark">
                  <div className="card text-center h-100 shadow-sm category-card">
                    <div className="card-body">
                      {cat.image ? (
                        <img src={imageUrl(cat.image)} alt={cat.name} style={{ height: 64, objectFit: "contain" }} className="mb-2 w-100" />
                      ) : (
                        <div className="category-icon-circle mb-2">
                          <Icon size={26} className="text-primary" />
                        </div>
                      )}
                      <div className="small fw-semibold mt-2">{cat.name}</div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured */}
      <div className="container py-3">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h3 className="section-heading mb-0 fw-bold">Featured Products</h3>
          <Link to="/shop?featured=1" className="text-decoration-none fw-semibold d-flex align-items-center gap-1">
            View All <FaArrowRight size={12} />
          </Link>
        </div>
        <div className="row g-4">
          {featured.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div className="container py-5">
        <div className="promo-banner p-5 text-center">
          <h3 className="fw-bold mb-2">Building a PC? We'll help you pick every part.</h3>
          <p className="mb-4" style={{ opacity: 0.85 }}>
            Browse components, compare specs, and get genuine warranty on every purchase.
          </p>
          <Link to="/shop?category_id=" className="btn btn-light fw-semibold px-4">
            Explore Components
          </Link>
        </div>
      </div>

      {/* New arrivals */}
      <div className="container py-3 mb-5">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <h3 className="section-heading mb-0 fw-bold">New Arrivals</h3>
          <Link to="/shop" className="text-decoration-none fw-semibold d-flex align-items-center gap-1">
            View All <FaArrowRight size={12} />
          </Link>
        </div>
        <div className="row g-4">
          {latest.map((p) => (
            <div className="col-6 col-md-4 col-lg-3" key={p.id}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}