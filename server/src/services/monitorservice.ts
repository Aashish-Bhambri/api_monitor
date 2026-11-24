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

    return result;
};
