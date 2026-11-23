import { HttpMethod, MonitorStatus } from "@prisma/client";
import type { Response } from "express";
import { prisma } from "../db/db.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import { executeMonitor } from "../services/monitorservice.js";
import { removeMonitorSchedule, scheduleMonitor } from "../queues/monitorScheduler.js";

// CREATE MONITOR
export const createMonitor = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { projectId, url, method, interval } = req.body;

        if (!projectId || typeof projectId !== "string" || !url || typeof url !== "string") {
            res.status(400).json({
                success: false,
                message: "Project ID and valid URL are required",
            });
            return;
        }

        // Check project ownership (must belong to logged-in user)
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            res.status(404).json({
                success: false,
                message: "Project not found or you do not have permission to add monitors to it",
            });
            return;
        }

        // Validate method if provided
        const validMethods = Object.values(HttpMethod);
        const resolvedMethod = method ? (method.toUpperCase() as HttpMethod) : HttpMethod.GET;
        if (method && !validMethods.includes(resolvedMethod)) {
            res.status(400).json({
                success: false,
                message: `Invalid HTTP method. Allowed methods: ${validMethods.join(", ")}`,
            });
            return;
        }

        const resolvedInterval = typeof interval === "number" && interval > 0 ? interval : 60;

        const monitor = await prisma.monitor.create({
            data: {
                projectId,
                url: url.trim(),
                method: resolvedMethod,
                interval: resolvedInterval,
                status: MonitorStatus.PENDING,
            },
        });
        await scheduleMonitor(monitor.id, resolvedInterval);
        res.status(201).json({
            success: true,
            message: "Monitor created successfully",
            monitor,
        });

    } catch (error) {
        console.error("Create monitor error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};


// GET ALL MONITORS
export const getMonitors = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const projectId = typeof req.query.projectId === "string" ? req.query.projectId : undefined;

        const monitors = await prisma.monitor.findMany({
            where: {
                project: {
                    userId: req.userId,
                },
                ...(projectId && { projectId }),
            },
            include: {
                results: {
                    take: 30,
                    orderBy: {
                        checkedAt: "desc",
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        res.status(200).json({
            success: true,
            count: monitors.length,
            monitors,
        });

    } catch (error) {
        console.error("Get monitors error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};


// GET SINGLE MONITOR
export const getMonitorById = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid monitor ID",
            });
            return;
        }

        const monitor = await prisma.monitor.findFirst({
            where: {
                id,
                project: {
                    userId: req.userId,
                },
            },
            include: {
                results: {
                    orderBy: {
                        checkedAt: "desc",
                    },
                    take: 20,
                },
                incidents: {
                    orderBy: {
                        startedAt: "desc",
                    },
                    take: 5,
                },
                logs: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 20,
                },
            },
        });

        if (!monitor) {
            res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            monitor,
        });

    } catch (error) {
        console.error("Get monitor by ID error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};


// UPDATE MONITOR
export const updateMonitor = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid monitor ID",
            });
            return;
        }

        const { url, method, interval, status } = req.body;

        // Check ownership
        const existingMonitor = await prisma.monitor.findFirst({
            where: {
                id,
                project: {
                    userId: req.userId,
                },
            },
        });

        if (!existingMonitor) {
            res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
            return;
        }

        // Validate method if provided
        let resolvedMethod: HttpMethod | undefined;
        if (method !== undefined) {
            const validMethods = Object.values(HttpMethod);
            const uppercaseMethod = typeof method === "string" ? (method.toUpperCase() as HttpMethod) : undefined;
            if (!uppercaseMethod || !validMethods.includes(uppercaseMethod)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid HTTP method. Allowed methods: ${validMethods.join(", ")}`,
                });
                return;
            }
            resolvedMethod = uppercaseMethod;
        }

        // Validate status if provided
        let resolvedStatus: MonitorStatus | undefined;
        if (status !== undefined) {
            const validStatuses = Object.values(MonitorStatus);
            const uppercaseStatus = typeof status === "string" ? (status.toUpperCase() as MonitorStatus) : undefined;
            if (!uppercaseStatus || !validStatuses.includes(uppercaseStatus)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed statuses: ${validStatuses.join(", ")}`,
                });
                return;
            }
            resolvedStatus = uppercaseStatus;
        }

        const monitor = await prisma.monitor.update({
            where: { id },
            data: {
                ...(url !== undefined && typeof url === "string" && { url: url.trim() }),
                ...(resolvedMethod !== undefined && { method: resolvedMethod }),
                ...(interval !== undefined && typeof interval === "number" && { interval }),
                ...(resolvedStatus !== undefined && { status: resolvedStatus }),
            },
        });

        res.status(200).json({
            success: true,
            message: "Monitor updated successfully",
            monitor,
        });

    } catch (error) {
        console.error("Update monitor error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};


// DELETE MONITOR
export const deleteMonitor = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid monitor ID",
            });
            return;
        }

        const existingMonitor = await prisma.monitor.findFirst({
            where: {
                id,
                project: {
                    userId: req.userId,
                },
            },
        });

        if (!existingMonitor) {
            res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
            return;
        }
        await removeMonitorSchedule(id);
        await prisma.monitor.delete({
            where: { id },
        });

        res.status(200).json({
            success: true,
            message: "Monitor deleted successfully",
        });

    } catch (error) {
        console.error("Delete monitor error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};


// TEST MONITOR
export const testMonitor = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        if (typeof req.userId !== "number") {
            res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
            return;
        }

        const { id } = req.params;

        if (typeof id !== "string") {
            res.status(400).json({
                success: false,
                message: "Invalid monitor ID",
            });
            return;
        }

        const monitor = await prisma.monitor.findFirst({
            where: {
                id,
                project: {
                    userId: req.userId,
                },
            },
        });

        if (!monitor) {
            res.status(404).json({
                success: false,
                message: "Monitor not found",
            });
            return;
        }

        // Execute live HTTP test
        const result = await executeMonitor(monitor);

        // Record the result
        const savedResult = await prisma.monitorResult.create({
            data: {
                monitorId: monitor.id,
                responseTime: result.responseTime,
                statusCode: result.statusCode,
                success: result.success,
            },
        });

        // Update monitor status
        await prisma.monitor.update({
            where: { id: monitor.id },
            data: {
                status: result.success ? MonitorStatus.UP : MonitorStatus.DOWN,
            },
        });

        res.status(200).json({
            success: true,
            message: "Monitor test executed successfully",
            testResult: {
                ...result,
                savedAt: savedResult.checkedAt,
            },
        });

    } catch (error) {
        console.error("Test monitor error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
