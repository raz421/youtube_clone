import { Router } from "express";
import { getAdminOverview, promoteUserToAdmin } from "../controllers/admin.controller.js";
import { requireRole, verifyJwt } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyJwt, requireRole("admin"));

router.get("/overview", getAdminOverview);
router.patch("/promote-user/:userId", promoteUserToAdmin);

export default router;
