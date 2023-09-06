import { FunctionComponent, useEffect, useState } from "react";
import { useSearchParams } from "../../../services/utils";
import {Project, Document, getDocument, getProject} from "../../../services/documents";
import {APIError} from "../../../services/apiError";
import styles from "../../../css/main.module.css";
import documentStyles from "./DocumentViewer.module.css";
import DocumentDetails from "./DocumentDetails";
import ProjectDetails from "./ProjectDetails";
import FetchMessage from "../../alerts/FetchMessage";
import {Skeleton} from "@mui/material";

const DocumentViewer: FunctionComponent = () => {
    const [projectID, setProjectID] = useState<string | null>();
    const [documentID, setDocumentID] = useState<string | null>();
    const [error, setError] = useState<APIError>();
    const [noData, setNoData] = useState<string>();
    const [project, setProject] = useState<Project>();
    const [document, setDocument] = useState<Document>();
    const searchParams = useSearchParams();
    const paramProject = "project";
    const paramDocument = "document";

    useEffect(() => {
        setProjectID(searchParams.get(paramProject));
        setDocumentID(searchParams.get(paramDocument));
    }, [searchParams.get(paramProject), searchParams.get(paramDocument)]);

    useEffect(() => {
        setProject(undefined);
        setDocument(undefined);
        setError(undefined);
        setNoData(undefined);
        if (projectID && documentID) {
            getDocument(projectID, documentID).then((result: Document) => {
                if (result) {
                    setDocument(result);
                    setProject(undefined)
                } else {
                    setNoData("Document not found");
                }
            }).catch((error: APIError) => {
                setError(error);
            });
        } else if (projectID) {
            getProject(projectID).then((result: Project) => {
                if (result) {
                    setProject(result);
                } else {
                    setNoData("ProjectDetails not found");
                }
            }).catch((error: APIError) => {
                setError(error);
            });
        }
    }, [projectID, documentID]);

    function createSkeleton() {
        return (
            <div className={styles.animated_panel}>
                <Skeleton variant="text" width={100} sx={{ fontSize: '1.4rem' }}/>
                <div className={documentStyles.skeleton_container}>
                    <Skeleton variant="text" width={100} sx={{ fontSize: '1.4rem' }}/>
                    <Skeleton variant="rounded" width={250} height={30} />
                </div>
                <div className={documentStyles.form_container}>
                    <div className={documentStyles.skeleton_container}>
                        <Skeleton variant="text" width={100} sx={{ fontSize: '1.4rem' }}/>
                        <Skeleton variant="rounded" width={250} height={30} />
                    </div>
                    <div className={documentStyles.skeleton_container}>
                        <Skeleton variant="text" width={100} sx={{ fontSize: '1.4rem' }}/>
                        <Skeleton variant="rounded" width={250} height={30} />
                    </div>
                </div>
                <Skeleton variant="rounded" height={500} className={documentStyles.skeleton_rectangle} />
            </div>
        );
    }

    return (
        <div className={documentStyles.container}>
            {document && !project &&
                <DocumentDetails document={document} projectID={projectID} />
            }
            {project && !document &&
                <ProjectDetails project={project} />
            }
            {!project && !document && !projectID && !documentID &&
                <div className={styles.typography_heading_sm}>
                    Select a project or document from the tree to view more information
                </div>
            }
            {noData && (
                <div>{noData}</div>
            )}
            {error && (
                <div>
                    <FetchMessage data={document} error={error.status} title="Browser" styleEnabled={true} />
                </div>
            )}
            {!document && !project && projectID && documentID && !error && !noData && (
                createSkeleton()
            )}
        </div>
    );
}

export default DocumentViewer;