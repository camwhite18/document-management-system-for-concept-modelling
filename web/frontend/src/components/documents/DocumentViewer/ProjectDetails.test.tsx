import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tester from "../../../__tests__/Tester";
import ProjectDetails from "./ProjectDetails";
import { Project } from "../../../services/documents";
import * as utils from "../../../services/utils";
import {navigateTo} from "../../../services/utils";

const project: Project = {
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
};

describe("ProjectDetails Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );
        expect(component).not.toBe(null);
    });
    test("Displays project details", async () => {
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );
        expect(component).not.toBe(null);
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Date Created")).toBeInTheDocument();
        expect(screen.getByText("Last Updated")).toBeInTheDocument();
    });
    test("Displays document list", async () => {
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );

        expect(component).not.toBe(null);
        expect(screen.getByText("Document 1")).toBeInTheDocument();
        expect(screen.getByText("Document 2")).toBeInTheDocument();
    });
    test("Delete project confirmation modal", async () => {
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the project: Project 1?")
            ).toBeInTheDocument()
        );
    });
    test("Delete project confirmation modal cancel", async () => {
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the project: Project 1?")
            ).toBeInTheDocument()
        );
        userEvent.click(screen.getByText("No"));
        await waitFor(() => expect(screen.queryByText("Confirm")).not.toBeInTheDocument());
    });
    test("Delete project confirmation modal confirm", async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(utils, "navigateTo").mockImplementation(mockNavigate);
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the project: Project 1?")
            ).toBeInTheDocument()
        );
        userEvent.click(screen.getByText("Yes"));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
    test("View document button clicked", async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(utils, "navigateTo").mockImplementation(mockNavigate);
        const component = await render(
            <Tester Component={ProjectDetails} props={{ project }} />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getAllByText("View")[0]);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/", new URLSearchParams({ document: "1" }), expect.any(Function));
    });
});