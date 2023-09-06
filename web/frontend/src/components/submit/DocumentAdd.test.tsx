import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import Tester from "../../__tests__/Tester";
import DocumentAdd from "./DocumentAdd";
import { CreatedDocumentResponse } from "../../services/submit";

const server = setupServer(
    rest.get(`${process.env.API_URL}/projects`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([
            { id: 1, name: "Project 1" },
            { id: 2, name: "Project 2" }
        ]));
    }),
    rest.post(`${process.env.API_URL}/create/document`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<CreatedDocumentResponse>({
            id: 1,
            name: "Document Title",
            timestamp: "2023-01-01T00:00:00.000000Z",
            project_id: 1
        }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("DocumentAdd Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
    });
    test("Form contains correct fields", async () => {
        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        expect(screen.getByText("Project")).toBeInTheDocument();
        expect(screen.getByText("Document Title")).toBeInTheDocument();
        expect(screen.getByText("Document Text")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });
    test("Fails form validation with empty fields", async () => {
        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
        });
    });
    test("Submits form with valid input", async () => {
        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: {value: "Document Title"}
        });

        fireEvent.change(screen.getByPlaceholderText("Enter text"), {
            target: {value: "Document Text"}
        });

        userEvent.selectOptions(screen.getByText("Select a project"), "1");

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Document Successfully Created")).toBeInTheDocument();
        });
    });
    test("Displays error message when project fetch fails", async () => {
        server.use(
            rest.get(`${process.env.API_URL}/projects`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({}));
            })
        );

        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        await waitFor(() => {
            expect(screen.getByText("Error loading projects")).toBeInTheDocument();
        });
    });
    test("Displays error message when document submission fails", async () => {
        server.use(
            rest.post(`${process.env.API_URL}/create/document`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({}));
            })
        );

        const component = await render(
            <Tester Component={DocumentAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: {value: "Document Title"}
        });

        fireEvent.change(screen.getByPlaceholderText("Enter text"), {
            target: {value: "Document Text"}
        });

        userEvent.selectOptions(screen.getByText("Select a project"), "1");

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Create Document")).toBeInTheDocument();
        });
    });
});