import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";
import Tester from "../../__tests__/Tester";
import ProjectAdd from "./ProjectAdd";
import { CreatedProjectResponse } from "../../services/submit";
import {useDispatch} from "../../state/hooks";
import {userUpdated} from "../../state/userSlice";

const server = setupServer(
    rest.post(`${process.env.API_URL}/create/project`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json<CreatedProjectResponse>({
            id: 1,
            name: "Project Title",
            timestamp: "2023-01-01T00:00:00.000000Z",
        }));
    })
);

const dispatch = useDispatch()

beforeAll(() => server.listen());
beforeEach(() => dispatch(userUpdated({username: "test", create_projects: true, project_permissions: {}})));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("ProjectAdd Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
    });
    test("Form contains correct fields", async () => {
        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        expect(screen.getByText("Project Name")).toBeInTheDocument();
        expect(screen.getByText("Permissions")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });
    test("Form not displayed when user doesn't have permission", async () => {
        dispatch(userUpdated({username: "test", create_projects: false, project_permissions: {}}))
        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        expect(screen.queryByText("Project Name")).not.toBeInTheDocument();
        expect(screen.queryByText("Permissions")).not.toBeInTheDocument();
        expect(screen.queryByText("Submit")).not.toBeInTheDocument();

        expect(screen.getByText("You do not have permission to create projects")).toBeInTheDocument();
    });
    test("Fails form validation with empty fields", async () => {
        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Please fill in all fields")).toBeInTheDocument();
        });
    });
    test("Submits form with valid input", async () => {
        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.change(screen.getByPlaceholderText("Enter name"), {
            target: {value: "Project Title"}
        });
        fireEvent.click(screen.getByLabelText('Give all other users read permissions'));
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Project Successfully Created")).toBeInTheDocument();
        });
    });
    test("Displays error message when project submission fails", async () => {
        server.use(
            rest.post(`${process.env.API_URL}/create/project`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({}));
            })
        );

        const component = await render(
            <Tester Component={ProjectAdd} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);

        fireEvent.change(screen.getByPlaceholderText("Enter name"), {
            target: {value: "Project Title"}
        });
        fireEvent.click(screen.getByLabelText('Give all other users read permissions'));
        fireEvent.click(screen.getByText("Submit"));

        await waitFor(() => {
            expect(screen.getByText("Create Document")).toBeInTheDocument();
        });
    });
});