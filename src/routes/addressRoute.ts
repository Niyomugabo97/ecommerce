
import { Router } from "express";
import {
  createAddress,
  getMyAddresses,
  updateAddresses,
} from "../controllers/addressController";
import protect from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, createAddress);
router.get("/", protect, getMyAddresses);
router.patch("/:id", protect, updateAddresses);

export default router;
