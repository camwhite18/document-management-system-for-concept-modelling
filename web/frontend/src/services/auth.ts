import { fetchApi } from "./utils";

export interface Tokens {
    access: string | undefined;
    refresh: string | undefined;
}

export interface LoginDetails {
    username: string;
    password: string;
}

export const getTokens = (loginDetails: LoginDetails): Promise<Tokens> => {
    return fetchApi<Tokens>("/token/", {
        method: "POST",
        body: JSON.stringify({
            "username": loginDetails.username,
            "password": loginDetails.password,
        })
    });
};
