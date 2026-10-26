import Address from "../models/Address.js";

const FIELDS = ["fullName", "phone", "addressLine", "city", "state", "pincode"];

export const saveAddress = async (req, res) => {
  const data = {};
  for (const field of FIELDS) {
    data[field] = String(req.body[field] ?? "").trim();
    if (!data[field]) {
      return res.status(400).json({ message: "Please fill in every address field" });
    }
  }

  const address = await Address.create({ ...data, userId: req.userId });
  res.status(201).json({ message: "Address saved", address });
};

export const getAddresses = async (req, res) => {
  const addresses = await Address.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(addresses);
};

export const deleteAddress = async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!address) return res.status(404).json({ message: "Address not found" });
  res.json({ message: "Address deleted" });
};
