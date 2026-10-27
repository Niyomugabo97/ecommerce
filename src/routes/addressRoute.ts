
import { Router } from "express";
import {
  createAddress,
  getMyAddresses,
  updateAddresses,
} from "../controllers/addressController";
import protect from "../middleware/authMiddleware";

const router = Router();

/**
 * @swagger
 * /api/address:
 *   post:
 *     summary: Add an address for the authenticated user
 *     description: The first address is made the default automatically. Set isDefault to true to make this address the default and unset any existing default address.
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, phoneNumber, street, city, country]
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: Alex Example
 *               phoneNumber:
 *                 type: string
 *                 example: "+1-555-0100"
 *               street:
 *                 type: string
 *                 example: 123 Main Street
 *               city:
 *                 type: string
 *                 example: Springfield
 *               province:
 *                 type: string
 *                 example: Illinois
 *               country:
 *                 type: string
 *                 example: United States
 *               postalCode:
 *                 type: string
 *                 example: "62701"
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Address created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Address'
 *       400:
 *         description: A required address field is missing
 *       401:
 *         description: Missing or invalid authentication token
 *       500:
 *         description: Failed to create address
 */
router.post("/", protect, createAddress);
router.get("/", protect, getMyAddresses);
router.patch("/:id", protect, updateAddresses);

export default router;
