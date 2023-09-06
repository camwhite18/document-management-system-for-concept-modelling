import { fetchApi } from "./utils";

export const ReadPermission = "read";
export const WritePermission = "write";

export interface User {
    username: string | undefined;
    create_projects: boolean;
    project_permissions: Record<string, typeof ReadPermission | typeof WritePermission>;
}

export const getUser = (): Promise<User> => {
    return fetchApi<User>("/user/", { method: "GET" });
};
