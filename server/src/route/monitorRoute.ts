
import { Router } from "express";
import { createMonitor, deleteMonitor, getMonitorById, getMonitors, pauseMonitor, resumeMonitor, testMonitor, updateMonitor } from "../controller/monitorController.js";
import { authenticate } from "../middleware/authMiddleware.js";



const router = Router();

router.use(authenticate)

router.post("/", createMonitor);
router.get("/", getMonitors);
router.get("/:id", getMonitorById);
router.patch("/:id", updateMonitor);
router.delete("/:id", deleteMonitor);
router.post("/:id/test", testMonitor);
router.patch('/:id/resume',resumeMonitor);
router.patch('/:id/pause',pauseMonitor);

export default router;
