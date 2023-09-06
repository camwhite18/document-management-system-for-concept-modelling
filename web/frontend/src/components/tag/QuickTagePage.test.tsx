import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Tester from "../../__tests__/Tester";
import QuickTagPage from "./QuickTagPage";
import { TaggedDocument } from "../../services/tag";
import { rest } from "msw";
import { setupServer } from "msw/node";

const taggedDocument: TaggedDocument = {
    tagged_text: "<strong>Hello</strong> World",
};

const server = setupServer(
    rest.post(`${process.env.API_URL}/tag`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(taggedDocument));
    }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("QuickTagPage Component", () => {
    test("Renders", () => {
        const component = render(<Tester Component={QuickTagPage} />);
        expect(component).not.toBe(null);
    });
    test("Renders with correct form fields", () => {
        const component = render(<Tester Component={QuickTagPage} />);
        expect(component).not.toBe(null);
        expect(screen.getByText("Input Text")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });
    test("Submit empty field", async () => {
        const component = await render(
            <Tester Component={QuickTagPage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(screen.getByText("Please fill in the text field")).toBeInTheDocument());
    });

    test("Submit and display tagged text", async () => {
        const component = await render(
            <Tester Component={QuickTagPage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        fireEvent.change(screen.getByPlaceholderText("Enter text"), { target: { value: "Hello World" } });
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(screen.queryByText("Loading...")).toBeInTheDocument());
        await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
        expect(screen.getByText("Tagged Text")).toBeInTheDocument();
        fireEvent.change(screen.getByPlaceholderText("Enter text"), { target: { value: "" } });
        expect(screen.getByText("Hello")).toBeInTheDocument()
        expect(screen.getByText("World")).toBeInTheDocument()
    });

    test("Display error", async () => {
        server.use(
            rest.post(`${process.env.API_URL}/tag`, (req, res, ctx) => {
                return res(ctx.status(500), ctx.json({}));
            }),
        );

        const component = await render(
            <Tester Component={QuickTagPage} memoryRouterPath="/" />
        );
        expect(component).not.toBe(null);
        fireEvent.change(screen.getByPlaceholderText("Enter text"), { target: { value: "Hello World" } });
        fireEvent.click(screen.getByText("Submit"));
        await waitFor(() => expect(screen.queryByText("Loading...")).toBeInTheDocument());
        await waitFor(() => expect(screen.queryByText("Loading...")).not.toBeInTheDocument());
        expect(screen.getByTestId("error")).toBeInTheDocument();
    });
});