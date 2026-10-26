import { useState } from "react";

const inputClass =
  "w-full rounded border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";

const toFormState = (product) => ({
  title: product?.title ?? "",
  description: product?.description ?? "",
  price: product?.price ?? "",
  category: product?.category ?? "",
  image: product?.image ?? "",
  stock: product?.stock ?? "",
});

export default function ProductForm({ initial, submitLabel, onSubmit }) {
  const [form, setForm] = useState(() => toFormState(initial));
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock || 0),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium">
        Title
        <input name="title" value={form.title} onChange={handleChange} className={inputClass} required />
      </label>
      <label className="block text-sm font-medium">
        Description
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium">
          Price (₹)
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          Stock
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={handleChange}
            className={inputClass}
          />
        </label>
      </div>
      <label className="block text-sm font-medium">
        Category
        <input name="category" value={form.category} onChange={handleChange} className={inputClass} />
      </label>
      <label className="block text-sm font-medium">
        Image URL
        <input name="image" value={form.image} onChange={handleChange} className={inputClass} />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:bg-slate-400"
      >
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
