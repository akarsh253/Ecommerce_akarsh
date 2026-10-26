import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Always respond with a populated cart, dropping items whose product was deleted
const formatCart = (cart) => {
  if (!cart) return { items: [] };
  const plain = cart.toObject();
  plain.items = plain.items.filter((item) => item.productId);
  return plain;
};

const loadCart = (userId) => Cart.findOne({ userId }).populate("items.productId");

const isValidId = (id) => typeof id === "string" && mongoose.isValidObjectId(id);

export const getCart = async (req, res) => {
  res.json(formatCart(await loadCart(req.userId)));
};

export const addToCart = async (req, res) => {
  const { productId } = req.body;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product" });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  let cart = await Cart.findOne({ userId: req.userId });
  if (!cart) cart = new Cart({ userId: req.userId, items: [] });

  const existing = cart.items.find((i) => i.productId.toString() === productId);
  const nextQty = (existing?.quantity ?? 0) + 1;

  if (nextQty > product.stock) {
    return res.status(400).json({
      message: product.stock === 0 ? "This product is out of stock" : `Only ${product.stock} in stock`,
    });
  }

  if (existing) existing.quantity = nextQty;
  else cart.items.push({ productId, quantity: 1 });

  await cart.save();
  await cart.populate("items.productId");
  res.json({ message: "Added to cart", cart: formatCart(cart) });
};

export const updateQuantity = async (req, res) => {
  const { productId, quantity } = req.body;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product" });
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be a whole number of at least 1" });
  }

  const cart = await Cart.findOne({ userId: req.userId });
  const item = cart?.items.find((i) => i.productId.toString() === productId);
  if (!item) return res.status(404).json({ message: "Item not found in cart" });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product no longer exists" });
  if (quantity > product.stock) {
    return res.status(400).json({ message: `Only ${product.stock} in stock` });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.productId");
  res.json({ message: "Quantity updated", cart: formatCart(cart) });
};

export const removeItem = async (req, res) => {
  const { productId } = req.params;
  if (!isValidId(productId)) {
    return res.status(400).json({ message: "Invalid product" });
  }

  const cart = await Cart.findOne({ userId: req.userId });
  if (!cart) return res.json({ message: "Item removed", cart: { items: [] } });

  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  await cart.populate("items.productId");
  res.json({ message: "Item removed", cart: formatCart(cart) });
};
