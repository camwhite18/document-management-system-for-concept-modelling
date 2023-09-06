import { FunctionComponent } from "react";
import { Allotment } from "allotment";
import ProjectsTree from "./ProjectsTree/ProjectsTree";
import DocumentViewer from "./DocumentViewer/DocumentViewer";

const DocumentsPage: FunctionComponent = () => {

    return (
        <Allotment defaultSizes={[100, 400]}>
            <Allotment.Pane snap maxSize={500}>
                <ProjectsTree />
            </Allotment.Pane>
            <Allotment.Pane>
                <DocumentViewer />
            </Allotment.Pane>
        </Allotment>
    );
};

export default DocumentsPage;