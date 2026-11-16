
import type { Response } from "express";
import { prisma } from "../db/db.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                success: false,
                message: "Project name is required",
            });
        }

        if (typeof req.userId !== "number") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId: req.userId,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            project,
        });
    } catch (error) {
        console.error("Create project error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create project",
        });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        if (typeof req.userId !== "number") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const projects = await prisma.project.findMany({
            where: {
                userId: req.userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json({
            success: true,
            projects,
        });
    } catch (error) {
        console.error("Get projects error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch projects",
        });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        if (typeof req.userId !== "number") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const project = await prisma.project.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        return res.status(200).json({
            success: true,
            project,
        });
    } catch (error) {
        console.error("Get project error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch project",
        });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        if (typeof req.userId !== "number") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        if (name !== undefined && (typeof name !== "string" || !name.trim())) {
            return res.status(400).json({
                success: false,
                message: "Invalid project name",
            });
        }

        const project = await prisma.project.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
            },
        });

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        console.error("Update project error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update project",
        });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        if (typeof id !== "string") {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID",
            });
        }

        if (typeof req.userId !== "number") {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const project = await prisma.project.findFirst({
            where: {
                id,
                userId: req.userId,
            },
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }

        await prisma.project.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error("Delete project error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete project",
        });
    }
};
