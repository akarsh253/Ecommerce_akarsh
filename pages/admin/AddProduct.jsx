import { useState } from "react";
import { useNavigate } from "react-router";
import api from "../../api/axios.js";
import ProductForm from "../../components/ProductForm.jsx";
import { getErrorMessage } from "../../utils/format.js";

export default function AddProduct() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    setError("");
    try {
      await api.post("/products", data);
      navigate("/admin/products");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Add product</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <ProductForm submitLabel="Add product" onSubmit={handleSubmit} />
    </div>
  );
}
