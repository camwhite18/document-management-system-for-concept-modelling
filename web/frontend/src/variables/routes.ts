import { FunctionComponent } from "react";
import LoginPage from "../components/login/LoginPage";
import NoMatch from "../components/alerts/NoMatch";
import HomePage from "../components/home/HomePage";
import DocumentsPage from "../components/documents/DocumentsPage";
import QuickTagPage from "../components/tag/QuickTagPage";
import SubmitPage from "../components/submit/SubmitPage";

export interface Route {
    name: string;
    path: string;
    component: FunctionComponent
}

export const routes: Route[] = [
    {name: "Home", path: "/", component: HomePage},
];

export const protectedRoutes: Route[] = [
    {name: "Document Browser", path: "/browser", component: DocumentsPage},
    {name: "Submit Documents", path: "/submit", component: SubmitPage},
    {name: "Quick Tag", path: "/tag", component: QuickTagPage},
];

export const defaultRoutePath = "/";

export const routeLogin: Route = {name: "Login", path: "/login", component: LoginPage};
export const routeNoMatch: Route = {name: "NoMatch", path: "*", component: NoMatch};
