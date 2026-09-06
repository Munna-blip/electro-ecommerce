import { useEffect, useState } from "react";
import api from "../api/axios";
import ProductCard from "../components/product/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/wishlist").then((res) => setItems(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="container py-4">
      <h4 className="mb-4">My Wishlist</h4>
      {items.length === 0 ? (
        <div className="text-center py-5 text-muted">Your wishlist is empty.</div>
      ) : (
        <div className="row g-4">
          {items.map((item) => (
            <div className="col-6 col-md-3" key={item.id}>
              <ProductCard product={item.product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
