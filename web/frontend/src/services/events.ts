import { fetchApi } from "./utils";


export interface Event {
    type: string;
    document_id: number;
    project_id: number;
    name: string;
    timestamp: string;
    action: string;
}

export const getEvents = (): Promise<Event[]> => {
    return fetchApi<Event[]>("/events/", { method: "GET" });
}