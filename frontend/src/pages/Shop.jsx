import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/product/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { formatCurrency } from "../utils/format";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category_id") || "";
  const brandId = searchParams.get("brand_id") || "";
  const sort = searchParams.get("sort") || "latest";
  const featured = searchParams.get("featured") || "";
  const page = searchParams.get("page") || 1;
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/brands").then((res) => setBrands(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", {
        params: {
          q, category_id: categoryId, brand_id: brandId, sort, featured, page,
          min_price: minPrice || undefined, max_price: maxPrice || undefined, per_page: 12,
        },
      })
      .then((res) => {
        setProducts(res.data.data);
        setMeta(res.data);
      })
      .finally(() => setLoading(false));
  }, [q, categoryId, brandId, sort, featured, page, minPrice, maxPrice]);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams);
    if (value) params[key] = value; else delete params[key];
    if (key !== "page") params.page = 1;
    setSearchParams(params);
  };

  return (
    <div className="container py-4">
      <h4 className="mb-4">{q ? `Search results for "${q}"` : "All Products"}</h4>
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold">Category</h6>
              <ul className="list-unstyled small">
                <li>
                  <button className={`btn btn-link p-0 text-decoration-none ${!categoryId && "fw-bold"}`} onClick={() => updateParam("category_id", "")}>
                    All Categories
                  </button>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      className={`btn btn-link p-0 text-decoration-none ${categoryId == c.id && "fw-bold text-primary"}`}
                      onClick={() => updateParam("category_id", c.id)}
                    >
                      {c.name} <span className="text-muted">({c.products_count})</span>
                    </button>
                  </li>
                ))}
              </ul>

              <hr />
              <h6 className="fw-bold">Brand</h6>
              <ul className="list-unstyled small">
                <li>
                  <button className={`btn btn-link p-0 text-decoration-none ${!brandId && "fw-bold"}`} onClick={() => updateParam("brand_id", "")}>
                    All Brands
                  </button>
                </li>
                {brands.map((b) => (
                  <li key={b.id}>
                    <button
                      className={`btn btn-link p-0 text-decoration-none ${brandId == b.id && "fw-bold text-primary"}`}
                      onClick={() => updateParam("brand_id", b.id)}
                    >
                      {b.name} <span className="text-muted">({b.products_count})</span>
                    </button>
                  </li>
                ))}
              </ul>

              <hr />
              <h6 className="fw-bold">Price Range</h6>
              <div className="d-flex gap-2 mb-2">
                <input type="number" className="form-control form-control-sm" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <input type="number" className="form-control form-control-sm" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
              <button className="btn btn-sm btn-outline-primary w-100" onClick={() => updateParam("min_price", minPrice)}>Apply</button>
            </div>
          </div>
        </div>

        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-muted small">{meta.total ?? 0} products found</span>
            <select className="form-select w-auto" value={sort} onChange={(e) => updateParam("sort", e.target.value)}>
              <option value="latest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="popular">Popularity</option>
            </select>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : products.length === 0 ? (
            <div className="text-center py-5 text-muted">No products found matching your criteria.</div>
          ) : (
            <>
              <div className="row g-4">
                {products.map((p) => (
                  <div className="col-6 col-lg-4" key={p.id}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {meta.last_page > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${p == page && "active"}`}>
                        <button className="page-link" onClick={() => updateParam("page", p)}>{p}</button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
