import React from "react";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import HomePage from "./HomePage";
import Tester from "../../__tests__/Tester";
import { Event } from "../../services/events";
import store from "../../state/store";
import {userUpdated} from "../../state/userSlice";
import * as utils from "../../services/utils";

const data: Event[] = [
    {
        document_id: 1,
        action: "created",
        type: "document",
        name: "Document 1",
        timestamp: "2023-01-01T00:00:00.000000Z",
        project_id: 1,
    },
    {
        document_id: 2,
        action: "updated",
        type: "document",
        name: "Document 2",
        timestamp: "2023-01-02T00:00:00.000000Z",
        project_id: 1,
    },
];

const server = setupServer(
    rest.get(`${process.env.API_URL}/events`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(data));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("HomePage Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
    });
    test("No username renders login prompt", async () => {
        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        expect(screen.queryByText(/Please log in to use the tool/i)).toBeInTheDocument();
        expect(screen.queryByText(/Login Here/i)).toBeInTheDocument();
    });
    test("Clicking login button", async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(utils, "navigateTo").mockImplementation(mockNavigate);

        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        const loginButton = screen.getByTestId(/login-button/i);
        expect(loginButton).toBeInTheDocument();

        fireEvent.click(loginButton);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/login", new URLSearchParams, expect.any(Function))
    });
    test("Username present renders activity list", async () => {
        store.dispatch(userUpdated({ username: "testuser", create_projects: true, project_permissions: {} }));
        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryByText(/Recent activity/i)).toBeInTheDocument());
        expect(screen.queryByText(/Document 1/i)).toBeInTheDocument();
        expect(screen.queryByText(/Document 2/i)).toBeInTheDocument();
    });
    test("Clicking on view in browser button", async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(utils, "navigateTo").mockImplementation(mockNavigate);
        store.dispatch(userUpdated({ username: "testuser", create_projects: true, project_permissions: {} }));

        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryByText(/Recent activity/i)).toBeInTheDocument());
        const eventButton = screen.getAllByText(/View in browser/i)[0];
        expect(eventButton).toBeInTheDocument();

        fireEvent.click(eventButton);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/browser", new URLSearchParams, expect.any(Function))
    });
    test("No activity found message", async () => {
        store.dispatch(userUpdated({ username: "testuser", create_projects: true, project_permissions: {} }));
        server.use(
            rest.get(`${process.env.API_URL}/events`, (req, res, ctx) => {
                return res(ctx.status(200), ctx.json([]));
            })
        );
        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        await waitFor(() => expect(screen.queryByText(/Recent activity/i)).toBeInTheDocument());
        expect(screen.queryByText(/No recent activity found/i)).toBeInTheDocument();
    });
    test("Error message displayed", async () => {
        server.use(
            rest.get(`${process.env.API_URL}/events`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({}));
            })
        );
        const component = await render(
            <Tester Component={HomePage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        store.dispatch({ type: "user/login", payload: { username: "testuser" } });
        await waitFor(() => expect(screen.queryByText(/Recent activity/i)).toBeInTheDocument());
        expect(screen.queryByText(/Failed to load events/i)).toBeInTheDocument();
    });
});