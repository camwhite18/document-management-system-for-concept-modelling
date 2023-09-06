import { fetchApi } from "./utils";

export interface DocumentProperties {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Document extends DocumentProperties {
    text: string
    tagged_text: string
}

export interface Project {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
    documents: DocumentProperties[];
}

export const getProjects = (): Promise<Project[]> => {
    return fetchApi<Project[]>("/projects/", { method: "GET" });
}

export const getProject = (projectID: string): Promise<Project> => {
    return fetchApi<Project>(`/project/${projectID}/`, { method: "GET" });
}

export const deleteProject = (projectID: string): Promise<void> => {
    return fetchApi<void>(`/project/${projectID}/`, { method: "DELETE" });
}

export const getDocument = (projectID: string, documentID: string): Promise<Document> => {
    return fetchApi<Document>(`/project/${projectID}/document/${documentID}/`, { method: "GET" });
}

export const deleteDocument = (projectID: string, documentID: string): Promise<void> => {
    return fetchApi<void>(`/project/${projectID}/document/${documentID}/`, { method: "DELETE" });
}
