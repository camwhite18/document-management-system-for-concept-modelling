import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DocumentDetails, {DocumentDetailsProps} from "./DocumentDetails";
import Tester from "../../../__tests__/Tester";
import { Document } from "../../../services/documents";
import * as utils from "../../../services/utils";
import userEvent from "@testing-library/user-event";

const document: Document = {
    id: 1,
    name: "Document 1",
    created_at: "2023-01-01T00:00:00.000000Z",
    updated_at: "2023-01-01T00:00:00.000000Z",
    text: "Sample text",
    tagged_text: "",
};

const documentProps: DocumentDetailsProps = { document, projectID: "1" };

describe("DocumentDetails Component", () => {
    test("Renders", async () => {
        const component = await render(
            <Tester Component={DocumentDetails} props={{ documentProps }} />
        );
        expect(component).not.toBe(null);
    });
    test("Displays document details", async () => {
        const component = await render(
            <Tester Component={DocumentDetails} props={ documentProps } />
        );
        expect(component).not.toBe(null);
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Date Created")).toBeInTheDocument();
        expect(screen.getByText("Last Updated")).toBeInTheDocument();
        expect(screen.getByText("Raw Text")).toBeInTheDocument();
    });
    test("Displays tagged text when available", async () => {
        // @ts-ignore
        documentProps.document.tagged_text = "<p>Sample tagged text</p>";
        const component = await render(
            <Tester Component={DocumentDetails} props={ documentProps } />
        );
        expect(component).not.toBe(null);
        expect(screen.getByText("Tagged Text")).toBeInTheDocument();
        expect(screen.getByText("Sample tagged text")).toBeInTheDocument();
    });
    test("Delete document confirmation modal", async () => {
        const component = await render(
            <Tester Component={DocumentDetails} props={ documentProps } />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the document: Document 1?")
            ).toBeInTheDocument()
        );
    });
    test("Delete document confirmation modal cancel", async () => {
        const component = await render(
            <Tester Component={DocumentDetails} props={ documentProps } />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the document: Document 1?")
            ).toBeInTheDocument()
        );
        userEvent.click(screen.getByText("No"));
        await waitFor(() => expect(screen.queryByText("Confirm")).not.toBeInTheDocument());
    });
    test("Delete document confirmation modal confirm", async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(utils, "navigateTo").mockImplementation(mockNavigate);
        const component = await render(
            <Tester Component={DocumentDetails} props={ documentProps } />
        );

        expect(component).not.toBe(null);
        userEvent.click(screen.getByText("Delete"));
        await waitFor(() => expect(screen.getByText("Confirm")).toBeInTheDocument());
        await waitFor(() =>
            expect(
                screen.getByText("Are you sure you want to delete the document: Document 1?")
            ).toBeInTheDocument()
        );
        userEvent.click(screen.getByText("Yes"));
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith("/");
    });
});