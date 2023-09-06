import { fetchApi } from "./utils";

export type CustomPermissions = { [key: string]: string };

export interface CreatedDocumentResponse {
    project_id: number;
    id: number;
    name: string;
    timestamp: string;
}

export interface CreatedProjectResponse {
    id: number;
    name: string;
    timestamp: string;
}

export const createDocument = (project: string, title: string, text: string): Promise<CreatedDocumentResponse> => {
    return fetchApi<CreatedDocumentResponse>("/create/document/", {
        method: "POST",
        body: JSON.stringify({
            project: project,
            name: title,
            text: text
        })
    });
}

export function createPermissionsMap(permissions: string): { [key: string]: string } {
    let perms: { [key: string]: string } = {};
    for (let perm of permissions.split(",")) {
        const splitPerm = perm.split(":");
        if (splitPerm.length != 2 || (splitPerm[1] != "r" && splitPerm[1] != "w")) {
            return {};
        }
        perms[splitPerm[0]] = splitPerm[1] === "w" ? "write" : "read";
    }
    return perms;
}

export const createProject = (name: string, permissions: string, customPerms: CustomPermissions): Promise<CreatedProjectResponse> => {
    return fetchApi<CreatedProjectResponse>("/create/project/", {
        method: "POST",
        body: JSON.stringify({
            name: name,
            permissions: permissions,
            custom_permissions: customPerms
        })
    });
}
