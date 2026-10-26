export const formatPrice = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export const getErrorMessage = (err, fallback = "Something went wrong. Please try again.") =>
  err?.response?.data?.message || fallback;

export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#e2e8f0"/><text x="200" y="158" font-size="20" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif">No image</text></svg>'
  );
