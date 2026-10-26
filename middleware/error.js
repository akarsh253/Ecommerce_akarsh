export const notFound = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Express 5 forwards errors from async handlers here automatically.
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid id" });
  }
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: "That value already exists" });
  }

  console.error(err);
  res.status(500).json({ message: "Server error" });
};
