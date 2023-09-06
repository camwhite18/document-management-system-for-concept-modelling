import { FunctionComponent } from "react";
import { APIError } from "../../services/apiError";

const ErrorToast: FunctionComponent<APIError> = (error: APIError) => {
    let path = "unknown";
    if (error.url) {
        const pathParts = error.url.split("/");
        path = pathParts[pathParts.length - 1];
    }

    return (
        <div data-testid="errorToast">
            <div>
                <strong>
                    {capitalizeFirstLetter(error.severity)} - {capitalizeFirstLetter(path)}
                </strong>
            </div>
            {error.message} {error.status && <small>({error.status})</small>}
        </div>
    );
};

const capitalizeFirstLetter = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

export default ErrorToast;
