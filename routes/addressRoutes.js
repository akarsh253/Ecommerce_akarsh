import express from "express";
import { saveAddress, getAddresses, deleteAddress } from "../controllers/addressController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", getAddresses);
router.post("/", saveAddress);
router.delete("/:id", deleteAddress);

export default router;
