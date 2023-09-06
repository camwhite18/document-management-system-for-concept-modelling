import React, {FunctionComponent, useState} from "react";
import {deleteProject, Project} from "../../../services/documents";
import pageStyles from "./DocumentViewer.module.css";
import styles from "../../../css/main.module.css";
import ListGroup from 'react-bootstrap/ListGroup';
import Button from "react-bootstrap/Button";
import {navigateTo, useSearchParams} from "../../../services/utils";
import {useLocation, useNavigate} from "react-router-dom";
import Form from "react-bootstrap/Form";
import moment from "moment/moment";
import Modal from "react-bootstrap/Modal";
import { APIError } from "../../../services/apiError";
import FetchMessage from "../../alerts/FetchMessage";
import {defaultRoutePath} from "../../../variables/routes";

export type ProjectDetailsProps = {
    project?: Project;
}

const ProjectDetails: FunctionComponent<ProjectDetailsProps> = ({project}: ProjectDetailsProps) => {
    const searchParams = useSearchParams();
    const history = useNavigate();
    const location = useLocation();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<APIError>();

    function handleViewDocument(documentID: string) {
        searchParams.set("document", documentID);
        navigateTo(location.pathname, searchParams, history);
    }

    const documentsList = () => {
        if (project) {
            if (project.documents.length === 0) {
                return (
                    <ListGroup.Item className={pageStyles.list_row}>
                        <div>No documents found</div>
                    </ListGroup.Item>
                );
            }
            return project.documents.map((document) => {
                return (
                    <ListGroup.Item key={document?.id} className={pageStyles.list_row}>
                        <p className={pageStyles.row_text}>{document?.name}</p>
                        <div className={pageStyles.list_row}>
                            <p className={pageStyles.row_text}>Date created: {moment(document?.created_at).format('DD/MM/YYYY HH:mm:ss')}</p>
                            <p className={pageStyles.row_text}>Last updated: {moment(document?.updated_at).format('DD/MM/YYYY HH:mm:ss')}</p>
                            <Button variant="dark" onClick={() => {handleViewDocument(document?.id.toString())}}>View</Button>
                        </div>
                    </ListGroup.Item>
                );
            });
        }
    }

    function handleDeleteProject() {
        if (!project) {
            return;
        }
        deleteProject(project?.id.toString()).then(() => {
            searchParams.delete("project");
            searchParams.delete("document");
            navigateTo(defaultRoutePath, searchParams, history);
        }).catch((error: APIError) => {
            setError(error);
        });
    }

    return (
        <>
            <div className={`${pageStyles.sub_container} ${styles.animated_panel}`}>
                <div className={styles.header_container}>
                    <p className={styles.typography_heading_sm}>Project</p>
                    <Button variant="outline-danger" onClick={() => setShowModal(true)}>Delete</Button>
                </div>
                <Form.Group controlId="formDocumentName" className={pageStyles.form_item}>
                    <Form.Label className={styles.typography_body_md}>Name</Form.Label>
                    <Form.Control readOnly type="text" placeholder={project?.name} className={pageStyles.form_input} />
                </Form.Group>
                <div className={pageStyles.form_container}>
                    <Form.Group controlId="formDocumentCreated" className={pageStyles.form_item}>
                        <Form.Label className={styles.typography_body_md}>Date Created</Form.Label>
                        <Form.Control readOnly type="text" placeholder={moment(project?.created_at).format('DD/MM/YYYY HH:mm:ss')} className={pageStyles.form_input} />
                    </Form.Group>
                    <Form.Group controlId="formDocumentUpdated" className={pageStyles.form_item}>
                        <Form.Label className={styles.typography_body_md}>Last Updated</Form.Label>
                        <Form.Control readOnly type="text" placeholder={moment(project?.updated_at).format('DD/MM/YYYY HH:mm:ss')} className={pageStyles.form_input} />
                    </Form.Group>
                </div>
                <Form.Label className={styles.typography_body_md}>Documents</Form.Label>
                <ListGroup>
                    {documentsList()}
                </ListGroup>
            </div>
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="sm"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Confirm
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete the project: {project?.name}?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={() => {
                        handleDeleteProject();
                    }}>
                        Yes
                    </Button>
                    <Button variant="outline-dark" onClick={() => {
                        setShowModal(false);
                    }}>
                        No
                    </Button>
                    {error &&
                        <div className={pageStyles.error_message}>
                            <FetchMessage data={undefined} error={error.status} title="Delete Project" styleEnabled={true} />
                        </div>
                    }
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ProjectDetails;
