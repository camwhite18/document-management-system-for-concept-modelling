import { NavigateFunction, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { errorHandler } from "./apiError";
import store from "../state/store";

export function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
    // Strip leading slash to normalise input.
    if (path.startsWith("/")) {
        path = path.substring(1);
    }

    const defaultHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.getState().persistedReducer.access}`
    };

    return errorHandler(fetch(`/api/${path}`, {
        ...init,
        mode: "cors",
        headers: {
            ...defaultHeaders,
            ...(init?.headers || {}),
        },
        body: init?.body ? init.body : undefined,
    }));
}

export function useSearchParams(): URLSearchParams {
    //get URLsearchParams object
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export function paramsToPath(searchParams: URLSearchParams): string {
    return searchParams.toString().length > 0 ? `?${searchParams.toString()}` : "";
}

export function navigateTo(path: string, searchParams: URLSearchParams, navigate: NavigateFunction): void {
    navigate(`${path}${paramsToPath(searchParams)}`);
}
