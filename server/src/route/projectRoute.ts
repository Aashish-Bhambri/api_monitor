import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { createProject, getProjectById, getProjects } from "../controller/projectController.js";


const router = Router();

router.post("/", authenticate, createProject);
router.get("/", authenticate, getProjects);
router.get("/:id",authenticate,getProjectById);


export default router;