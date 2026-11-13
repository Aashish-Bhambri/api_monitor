import type { Response } from "express";
import { prisma } from "../db/db.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

export const createProject = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const { name, description } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({ message: "Project name is required" });
        }

        const userId = parseInt(req.userId!, 10);
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Invalid user identity" });
        }

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId
            }
        });

        return res.status(201).json({
            message: "Project created successfully",
            project
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create project"
        });
    }
};


export const getProjects = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = parseInt(req.userId!, 10);
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Invalid user identity" });
        }

        const projects = await prisma.project.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return res.status(200).json({
            projects
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch projects"
        });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        if (typeof id !== "string") {
            return res.status(400).json({ message: "Invalid project id" });
        }

        const userId = parseInt(req.userId!, 10);
        if (isNaN(userId)) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const project = await prisma.project.findFirst({
            where: { id, userId }
        })
        if (!project) {
            return res.status(404).json({
                message: "Project not found"
            });
        }

        return res.status(200).json({
            project
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch project"
        })
    }
}