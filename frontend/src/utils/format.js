export const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const imageUrl = (path) => {
  if (!path) return "https://placehold.co/400x400?text=Electro";
  if (path.startsWith("http")) return path;
  const base = import.meta.env.VITE_STORAGE_URL || "http://localhost:8000/storage";
  return `${base}/${path}`;
};
