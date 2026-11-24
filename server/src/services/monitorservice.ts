import { MonitorStatus, type Monitor, type Prisma } from "@prisma/client";
import axios from "axios";
import { prisma } from "../db/db.js";

export interface ExecutionResult {
    statusCode: number | null;
    responseTime: number;
    success: boolean;
    error?: string;
}

export const executeMonitor = async (monitor: Monitor): Promise<ExecutionResult> => {
    const startTime = performance.now();

    try {
        const response = await axios({
            url: monitor.url,
            method: monitor.method,
            timeout: 10000,
            validateStatus: () => true,
        });

        const responseTime = Math.round(performance.now() - startTime);

        return {
            statusCode: response.status,
            responseTime,
            success: response.status >= 200 && response.status < 400,
        };
    } catch (error: any) {
        const responseTime = Math.round(performance.now() - startTime);
        return {
            statusCode: error.response?.status ?? null,
            responseTime,
            success: false,
            error: error.message || "Request failed",
        };
    }
};


export const runMonitorCheck = async (monitorId: string) => {
    const monitor = await prisma.monitor.findUnique({
        where: {
            id: monitorId,
        },
    });

    if (!monitor) {
        throw new Error(`Monitor not found: ${monitorId}`);
    }

    if (monitor.status === MonitorStatus.PAUSED) {
        console.log(`Skipping check: monitor ${monitorId} is currently PAUSED`);
        return {
            statusCode: null,
            responseTime: 0,
            success: false,
            error: "Monitor is paused",
        };
    }

    const result = await executeMonitor(monitor);

    await prisma.$transaction([
        prisma.monitorResult.create({
            data: {
                monitorId: monitor.id,
                responseTime: result.responseTime,
                statusCode: result.statusCode,
                success: result.success,
            },
        }),

        prisma.monitorLog.create({
            data: {
                monitorId: monitor.id,
                requestDetails: {
                    url: monitor.url,
                    method: monitor.method,
                    timeout: 10000,
                } as Prisma.InputJsonValue,
                error: result.error ?? null,
                executionResult: JSON.stringify(result),
            },
        }),

        prisma.monitor.update({
            where: { id: monitor.id },
            data: {
                status: result.success ? MonitorStatus.UP : MonitorStatus.DOWN,
            },
        }),
    ]);

    // Automated Incident Detection & Auto-Resolution
    try {
        if (!result.success) {
            const existingIncident = await prisma.incident.findFirst({
                where: { monitorId: monitor.id, status: 'ONGOING' },
            });
            if (!existingIncident) {
                await prisma.incident.create({
                    data: {
                        monitorId: monitor.id,
                        status: 'ONGOING',
                        cause: result.error || `HTTP ${result.statusCode || 500} - Failure detected during interval check`,
                        startedAt: new Date(),
                    },
                });
            }
        } else {
            const ongoing = await prisma.incident.findMany({
                where: { monitorId: monitor.id, status: 'ONGOING' },
            });
            for (const inc of ongoing) {
                const now = new Date();
                const duration = Math.round((now.getTime() - new Date(inc.startedAt).getTime()) / 1000);
                await prisma.incident.update({
                    where: { id: inc.id },
                    data: {
                        status: 'RESOLVED',
                        resolvedAt: now,
                        duration,
                    },
                });
            }
        }
    } catch (incidentErr) {
        console.error("Incident tracking error:", incidentErr);
    }

    return result;
};
