import type { Monitor } from "@prisma/client";
import axios from "axios";

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
