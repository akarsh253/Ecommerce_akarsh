import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Address from "../models/Address.js";

// Give back stock that was already reserved for an order that did not complete
const releaseStock = async (reserved) => {
  await Promise.all(
    reserved.map((item) =>
      Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
    )
  );
};

export const placeOrder = async (req, res) => {
  const { addressId } = req.body;
  if (typeof addressId !== "string" || !mongoose.isValidObjectId(addressId)) {
    return res.status(400).json({ message: "Please select a delivery address" });
  }

  const address = await Address.findOne({ _id: addressId, userId: req.userId });
  if (!address) return res.status(400).json({ message: "Address not found" });

  const cart = await Cart.findOne({ userId: req.userId }).populate("items.productId");
  const cartItems = (cart?.items ?? []).filter((i) => i.productId);
  if (cartItems.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  const orderItems = cartItems.map((i) => ({
    productId: i.productId._id,
    title: i.productId.title,
    image: i.productId.image,
    quantity: i.quantity,
    price: i.productId.price,
  }));
  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Reserve stock one product at a time. The $gte check and $inc happen in a
  // single atomic update, so stock can never go negative even with two buyers.
  const reserved = [];
  try {
    for (const item of orderItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (!updated) {
        await releaseStock(reserved);
        return res.status(400).json({ message: `Not enough stock for ${item.title}` });
      }
      reserved.push(item);
    }

    const order = await Order.create({
      userId: req.userId,
      items: orderItems,
      address: {
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
      totalAmount,
      paymentMethod: "COD",
    });

    await Cart.updateOne({ userId: req.userId }, { items: [] });

    res.status(201).json({ message: "Order placed", orderId: order._id });
  } catch (error) {
    await releaseStock(reserved);
    throw error;
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(orders);
};

export const getOrderById = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
};
