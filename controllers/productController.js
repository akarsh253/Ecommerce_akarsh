import Product from "../models/Product.js";

const FIELDS = ["title", "description", "price", "category", "image", "stock"];

const pickFields = (body) =>
  Object.fromEntries(FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]));

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createProduct = async (req, res) => {
  const product = await Product.create(pickFields(req.body));
  res.status(201).json({ message: "Product created", product });
};

export const getProducts = async (req, res) => {
  const { search, category } = req.query;
  const filter = {};

  if (typeof search === "string" && search.trim()) {
    filter.title = { $regex: escapeRegex(search.trim()), $options: "i" };
  }
  if (typeof category === "string" && category.trim()) {
    filter.category = category.trim();
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
};

export const getCategories = async (req, res) => {
  const categories = await Product.distinct("category");
  res.json(categories.filter(Boolean).sort());
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, pickFields(req.body), {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product updated", product });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product deleted" });
};
