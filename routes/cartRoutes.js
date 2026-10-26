import express from "express";
import { getCart, addToCart, updateQuantity, removeItem } from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.patch("/update", updateQuantity);
router.delete("/remove/:productId", removeItem);

export default router;
