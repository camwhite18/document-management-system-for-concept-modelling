import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { setupServer } from "msw/node";
import LoginPage from "./LoginPage";
import Tester from "../../__tests__/Tester";
import * as auth from "../../services/auth";

jest.mock("../../services/auth");

const server = setupServer(
    rest.post(`${process.env.API_URL}/token/`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                access_token: "test_access_token",
                refresh_token: "test_refresh_token",
            })
        );
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("LoginPage Component", () => {
    test("Renders", () => {
        const component = render(
            <Tester Component={LoginPage} />
        );
        expect(component).not.toBe(null);
    });

    test("Displays form inputs", () => {
        render(<Tester Component={LoginPage} />);
        expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    test("Updates input values", async () => {
        render(<Tester Component={LoginPage} />);
        const usernameInput = screen.getByPlaceholderText("Username");
        const passwordInput = screen.getByPlaceholderText("Password");

        await userEvent.type(usernameInput, "test_user");
        await userEvent.type(passwordInput, "test_password");

        expect(usernameInput).toHaveValue("test_user");
        expect(passwordInput).toHaveValue("test_password");
    });
    test("Successful login", async () => {
        render(<Tester Component={LoginPage} />);
        const mockTokens: auth.Tokens = {
            access: "mock_access_token",
            refresh: "mock_refresh_token",
        };

        const getTokensMock = jest.spyOn(auth, "getTokens");
        getTokensMock.mockResolvedValue(mockTokens);

        const usernameInput = screen.getByPlaceholderText("Username");
        const passwordInput = screen.getByPlaceholderText("Password");
        const loginButton = screen.getByText("Login");

        userEvent.type(usernameInput, "test_user");
        userEvent.type(passwordInput, "test_password");
        fireEvent.click(loginButton);

        await waitFor(() =>
            expect(getTokensMock).toHaveBeenCalledWith({
                username: "test_user",
                password: "test_password",
            })
        );

        getTokensMock.mockRestore();
    });
    test("Displays error on unsuccessful login", async () => {
        server.use(
            rest.post(`${process.env.API_URL}/token/`, (req, res, ctx) => {
                return res(ctx.status(400), ctx.json({}));
            })
        );

        render(<Tester Component={LoginPage} />);
        const usernameInput = screen.getByPlaceholderText("Username");
        const passwordInput = screen.getByPlaceholderText("Password");
        const loginButton = screen.getByText("Login");

        userEvent.type(usernameInput, "test_user");
        userEvent.type(passwordInput, "test_password");
        fireEvent.click(loginButton);

        await waitFor(() => expect(screen.getByText("Invalid username or password")).toBeInTheDocument());
    });
});