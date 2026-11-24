
import { Router } from "express";
import {
  createMonitor,
  deleteMonitor,
  getMonitorById,
  getMonitors,
  pauseMonitor,
  resumeMonitor,
  testMonitor,
  updateMonitor,
  getIncidents,
  acknowledgeIncident,
  getLogs,
} from "../controller/monitorController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);

// Collection endpoints
router.post("/", createMonitor);
router.get("/", getMonitors);

// Incidents & Logs
router.get("/incidents", getIncidents);
router.patch("/incidents/:id/acknowledge", acknowledgeIncident);
router.get("/logs", getLogs);

// Single monitor operations
router.get("/:id", getMonitorById);
router.patch("/:id", updateMonitor);
router.delete("/:id", deleteMonitor);
router.delete("/:id/delete", deleteMonitor);
router.post("/:id/test", testMonitor);
router.patch("/:id/resume", resumeMonitor);
router.patch("/:id/pause", pauseMonitor);

export default router;
