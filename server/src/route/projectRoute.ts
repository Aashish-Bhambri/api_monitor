import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    updateProject
} from "../controller/projectController.js";

const router = Router();

router.use(authenticate);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;
