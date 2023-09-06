export function getHttpResponseMessage(statusCode: number | undefined): string | undefined {
    if (statusCode === undefined) {
        return undefined;
    }

    const firstDigit = parseInt(String(statusCode).charAt(0), 10);

    if (errorMessagesCodes.includes(statusCode)){
        return errorMessages.find(errorMessage => errorMessage.statusCode === statusCode)?.description;
    }
    else if (generalStatusCodes.includes(firstDigit)) {
        return generalStatus.find(errorMessage => errorMessage.statusCode === firstDigit)?.description;
    }
    return undefined;
}

export type errorMessage = {
    statusCode: number
    description: string
}

export const generalStatus: errorMessage[] = [
    {
        "statusCode": 1,
        "description": "Informational response",
    },
    {
        "statusCode": 2,
        "description": "Success"
    },
    {
        "statusCode": 3,
        "description": "Redirection"
    },
    {
        "statusCode": 4,
        "description": "Client Error"
    },
    {
        "statusCode": 5,
        "description": "Server Error"
    }
];

export const errorMessages: errorMessage[] = [
    {
        "statusCode": 400,
        "description": "Invalid request sent to server"
    },
    {
        "statusCode": 401,
        "description": "Failed to authenticate with the server"
    },
    {
        "statusCode": 403,
        "description": "No permissions to view this resource"
    },
    {
        "statusCode": 404,
        "description": "The requested resource does not exist"
    },
    {
        "statusCode": 409,
        "description": "The requested resource is already in use"
    },
    {
        "statusCode": 412,
        "description": "Precondition Failed"
    },
    {
        "statusCode": 500,
        "description": "Internal Server Error"
    },
    {
        "statusCode": 503,
        "description": "Service Unavailable"
    },
    {
        "statusCode": 504,
        "description": "Gateway Timeout"
    }];

export const errorMessagesCodes = errorMessages.map(errorMessage => errorMessage.statusCode);
export const generalStatusCodes = generalStatus.map(errorMessage => errorMessage.statusCode);
