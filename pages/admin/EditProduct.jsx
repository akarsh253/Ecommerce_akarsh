import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import api from "../../api/axios.js";
import ProductForm from "../../components/ProductForm.jsx";
import { getErrorMessage } from "../../utils/format.js";

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (!ignore) setProduct(res.data);
      })
      .catch((err) => {
        if (!ignore) setError(getErrorMessage(err, "Could not load this product."));
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleSubmit = async (data) => {
    setError("");
    try {
      await api.put(`/products/${id}`, data);
      navigate("/admin/products");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold">Edit product</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {product ? (
        <ProductForm initial={product} submitLabel="Save changes" onSubmit={handleSubmit} />
      ) : (
        !error && <p className="text-slate-500">Loading...</p>
      )}
    </div>
  );
}
