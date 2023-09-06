import React from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import Tester from "../../../__tests__/Tester";
import ProjectsTree from "./ProjectsTree";
import { Project } from "../../../services/documents";
import {setupServer} from "msw/node";
import {rest} from "msw";

const data: Project[] = [
    {
        id: 1,
        name: "Project 1",
        created_at: "2023-01-01T00:00:00.000000Z",
        updated_at: "2023-01-01T00:00:00.000000Z",
        documents: [
            {
                id: 1,
                name: "Document 1",
                created_at: "2023-01-01T00:00:00.000000Z",
                updated_at: "2023-01-01T00:00:00.000000Z",
            },
            {
                id: 2,
                name: "Document 2",
                created_at: "2023-01-01T00:00:00.000000Z",
                updated_at: "2023-01-01T00:00:00.000000Z",
            },
        ],
    },
];

const pathTemplate = "/projects";
const memoryRouterPath = `/projects`;

const server = setupServer(
    rest.get(`${process.env.API_URL}/projects`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(data));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ProjectsTree Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
    });
    test("Loading skeleton", async () => {
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        expect(screen.queryAllByTestId("skeleton")[0]).toBeInTheDocument();
        expect(screen.queryByTestId("tree")).not.toBeInTheDocument();
    });
    test("Loaded with data", async () => {
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryAllByTestId("skeleton")[0]).not.toBeInTheDocument());
        expect(screen.queryByTestId("tree")).toBeInTheDocument();
    });
    test("Expand project", async () => {
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryAllByTestId("skeleton")[0]).not.toBeInTheDocument());
        expect(screen.queryByTestId("tree")).toBeInTheDocument();
        const project = screen.queryAllByTestId("project")[0];
        fireEvent.click(project);
        expect(screen.queryAllByTestId("project")[0]).toHaveClass("Mui-expanded");
    });
    test("Select document", async () => {
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryAllByTestId("skeleton")[0]).not.toBeInTheDocument());
        expect(screen.queryByTestId("tree")).toBeInTheDocument();
        const project = screen.queryAllByTestId("project")[0];
        fireEvent.click(project);
        expect(screen.queryAllByTestId("project")[0]).toHaveClass("Mui-expanded");
        const document = screen.queryAllByTestId("document")[0];
        fireEvent.click(document);
        expect(screen.queryAllByTestId("document")[0]).toHaveClass("Mui-selected");
        // Check if the document id was added to the url params
        expect(window.location.search).toContain("documentId=1");
    });
    test("Display no data message", async () => {
        rest.get(`${process.env.API_URL}/projects`, (req, res, ctx) => {
            return res(ctx.status(200), ctx.json([]));
        });
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryAllByTestId("skeleton")[0]).not.toBeInTheDocument());
        expect(screen.queryByTestId("tree")).toBeInTheDocument();
        expect(screen.queryByTestId("no-data")).toBeInTheDocument();
    });
    test("Display error message", async () => {
        rest.get(`${process.env.API_URL}/projects`, (req, res, ctx) => {
            return res(ctx.status(500), ctx.json({}));
        });
        const component = await render(
            <Tester Component={ProjectsTree} pathTemplate={pathTemplate} memoryRouterPath={memoryRouterPath} />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryAllByTestId("skeleton")[0]).not.toBeInTheDocument());
        expect(screen.queryByTestId("tree")).toBeInTheDocument();
        expect(screen.queryByTestId("error")).toBeInTheDocument();
    });
});