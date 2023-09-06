import React, { FunctionComponent, useEffect, useState } from "react";
import { deleteDocument, Document } from "../../../services/documents";
import styles from "../../../css/main.module.css";
import pageStyles from "./DocumentViewer.module.css"
import Form from 'react-bootstrap/Form';
import moment from "moment";
import parse from 'html-react-parser';
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { rebuild } from "../../../utils/tooltip";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import FetchMessage from "../../alerts/FetchMessage";
import { APIError } from "../../../services/apiError";
import { navigateTo, useSearchParams } from "../../../services/utils";
import { defaultRoutePath } from "../../../variables/routes";
import { useNavigate } from "react-router-dom";

export type DocumentDetailsProps = {
    document?: Document;
    projectID?: string | null;
}

const DocumentDetails: FunctionComponent<DocumentDetailsProps> = ({document, projectID}: DocumentDetailsProps) => {
    const searchParams = useSearchParams();
    const history = useNavigate();
    const [showModal, setShowModal] = useState<boolean>(false);
    const [error, setError] = useState<APIError>();

    useEffect(() => {
        rebuild();
    }, []);

    function handleDeleteDocument() {
        if (!document || !projectID) {
            return;
        }
        deleteDocument(projectID, document?.id.toString()).then(() => {
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
                    <p className={styles.typography_heading_sm}>Document</p>
                    <Button variant="outline-danger" onClick={() => setShowModal(true)}>Delete</Button>
                </div>
                <Form.Group controlId="formDocumentName" className={pageStyles.form_item}>
                    <Form.Label className={styles.typography_body_md}>Name</Form.Label>
                    <Form.Control readOnly type="text" placeholder={document?.name} className={pageStyles.form_input} />
                </Form.Group>
                <div className={pageStyles.form_container}>
                    <Form.Group controlId="formDocumentCreated" className={pageStyles.form_item}>
                        <Form.Label className={styles.typography_body_md}>Date Created</Form.Label>
                        <Form.Control readOnly type="text" placeholder={moment(document?.created_at).format('DD/MM/YYYY HH:mm:ss')} className={pageStyles.form_input} />
                    </Form.Group>
                    <Form.Group controlId="formDocumentUpdated" className={pageStyles.form_item}>
                        <Form.Label className={styles.typography_body_md}>Last Updated</Form.Label>
                        <Form.Control readOnly type="text" placeholder={moment(document?.updated_at).format('DD/MM/YYYY HH:mm:ss')} className={pageStyles.form_input} />
                    </Form.Group>
                </div>
                <Form.Group controlId="formDocumentText" className="mb-3">
                    {document?.tagged_text ? (
                            <>
                                <Form.Label className={styles.typography_body_md}>Tagged Text</Form.Label>
                                <div className={styles.tagged_text}>
                                    {parse(document?.tagged_text)}
                                </div>
                            </>
                        ) : (
                            <>
                                <Form.Label className={styles.typography_body_md}>Raw Text <InfoOutlinedIcon
                                    data-tip={"Text tagging in progress"}
                                    fontSize="small" /></Form.Label>
                                <Form.Control readOnly type="text" placeholder={document?.text} as={'textarea'} rows={11} className={pageStyles.text_area} />
                            </>
                        )
                    }
                </Form.Group>
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
                    <p>Are you sure you want to delete the document: {document?.name}?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={() => {
                        handleDeleteDocument();
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
                            <FetchMessage data={undefined} error={error.status} title="Delete Document" styleEnabled={true} />
                        </div>
                    }
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DocumentDetails;
