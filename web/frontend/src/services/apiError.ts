import { addAPIError } from "../state/apiErrorSlice";
import { appDispatch } from "../state/dispatch";

export const errorHandler = async <T>(promise: Promise<Response>): Promise<T> => {
    try {
        return await extractResponse(promise);
    } catch (e) {
        let error = e as Error;
        if (!isAPIError(error)) {
            error = wrapError(error);
        }
        appDispatch(addAPIError(error as APIError));
        throw error;
    }
};

const extractResponse = async <T>(promise: Promise<Response>): Promise<T> => {
    const response = await promise;
    let value;
    try {
        value = await response.json();
    } catch (e) {
        throw errorFromResponse(response);
    }

    if (value && value["error"]) {
        throw errorFromResponse(response, value.error);
    }
    if (!response.ok) {
        throw errorFromResponse(response);
    }
    return value;
};

const wrapError = (error: Error): APIError => {
    return { message: error.message, name: apiErrorName, severity: Severity.Error };
};

export enum Severity {
    Error = "error",
    Warning = "warning",
}

const isAPIError = (error: Error): boolean => {
    return error.name === apiErrorName;
};

const apiErrorName = "API Error";
const errorFromResponse = (response: Response, customMessage?: string): APIError => {
    let severity = Severity.Error;
    let message = customMessage || "";

    if (errorSpecs.has(response.status)) {
        severity = errorSpecs.get(response.status)?.severity || severity;
        if (!message) {
            message = errorSpecs.get(response.status)?.message || "";
        }
    }

    if (!message && response.statusText) {
        message = response.statusText;
    }

    return {
        message,
        name: apiErrorName,
        status: response.status,
        severity,
        url: response.url,
    };
};

export interface APIError extends Error {
    status?: number;
    url?: string;
    severity: Severity;
}

interface ErrorSpec {
    severity: Severity;
    message: string;
}

export const errorSpecs: Map<number, ErrorSpec> = new Map<number, ErrorSpec>([
    [
        400,
        {
            severity: Severity.Error,
            message: "Invalid request sent to server",
        },
    ],
    // [
    //     401,
    //     {
    //         severity: Severity.Error,
    //         message: "Failed to authenticate with the server",
    //     },
    // ],
    [
        403,
        {
            severity: Severity.Error,
            message: "No permissions to view this resource",
        },
    ],
    [
        404,
        {
            severity: Severity.Error,
            message: "The requested resource does not exist",
        },
    ],
    [
        409,
        {
            severity: Severity.Warning,
            message: "The requested resource is already in use",
        },
    ],
    [
        412,
        {
            severity: Severity.Error,
            message: "Precondition Failed",
        },
    ],
    [
        500,
        {
            severity: Severity.Error,
            message: "Internal Server Error",
        },
    ],
    [
        503,
        {
            severity: Severity.Error,
            message: "Service Unavailable",
        },
    ],
    [
        504,
        {
            severity: Severity.Error,
            message: "Gateway Timeout",
        },
    ],
]);
