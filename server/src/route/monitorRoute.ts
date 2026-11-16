
import { Router } from "express";
import { createMonitor, deleteMonitor, getMonitorById, getMonitors, testMonitor, updateMonitor } from "../controller/monitorController.js";
import { authenticate } from "../middleware/authMiddleware.js";



const router = Router();

router.use(authenticate)

router.post("/", createMonitor);
router.get("/", getMonitors);
router.get("/:id", getMonitorById);
router.patch("/:id", updateMonitor);
router.delete("/:id", deleteMonitor);
router.post("/:id/test", testMonitor);

export default router;
