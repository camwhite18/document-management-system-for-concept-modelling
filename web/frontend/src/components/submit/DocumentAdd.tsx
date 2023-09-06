import React, {FunctionComponent, useEffect, useState} from "react";
import styles from "../../css/main.module.css";
import pageStyles from "./SubmitPage.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { createDocument, CreatedDocumentResponse } from "../../services/submit";
import { APIError } from "../../services/apiError";
import FetchMessage from "../alerts/FetchMessage";
import { useSelector } from "../../state/hooks";
import { WritePermission } from "../../services/user";
import Modal from "react-bootstrap/Modal";
import { navigateTo, useSearchParams } from "../../services/utils";
import { useNavigate } from "react-router-dom";
import { getProjects } from "../../services/documents";
import moment from "moment/moment";

const noneSelected = "none";


const DocumentAdd: FunctionComponent = () => {
    const searchParams = useSearchParams();
    const history = useNavigate();
    const [project, setProject] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const [error, setError] = useState<APIError>();
    const [invalidDetails, setInvalidDetails] = useState<string>("");
    const [response, setResponse] = useState<CreatedDocumentResponse>();
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const defaultProject = "Select a project";
    const [userProjects, setUserProjects] = useState<JSX.Element[]>();
    const userProjectPermissions = useSelector((state) => state.user.project_permissions);

    const onProjectChange = ({target:{value}}: any) => setProject(value);
    const onTitleChange = ({target:{value}}: any) => setTitle(value);
    const onTextChange = ({target:{value}}: any) => setText(value);

    useEffect(() => {
        // Get the user's projects and add them to the dropdown
        getProjects().then((result) => {
            const projects: JSX.Element[] = [];
            if (result.length === 0) {
                projects.push(<option key={noneSelected} disabled>No projects found</option>)
            } else {
                projects.push(<option key={noneSelected} hidden>{defaultProject}</option>)
            }
            for (let i = 0; i < result.length; i++) {
                if (userProjectPermissions && userProjectPermissions[result[i].id] === WritePermission) {
                    projects.push(<option value={result[i].id}>{result[i].name}</option>)
                } else {
                    projects.push(<option value={result[i].id} disabled>{result[i].name}</option>)
                }
            }
            setUserProjects(projects);
        }).catch((error) => {
            setUserProjects([<option key={noneSelected} disabled>Error loading projects</option>])
            setError(error);
        });
    }, [userProjectPermissions]);

    const formSubmit = (event: any) => {
        event.preventDefault();
        setInvalidDetails("")
        setError(undefined)
        if (project === noneSelected || title === "" || text === "" || project === defaultProject) {
            setInvalidDetails("Please fill in all fields");
            return;
        }
        createDocument(project, title, text).then((result) => {
            setResponse(result)
            setShowModal(true);
        }).catch((error) => {
            setError(error);
        });
    }

    return (
        <>
            <Form onSubmit={formSubmit}>
                <Form.Group controlId="formProject" className="mb-3">
                    <Form.Label className={styles.typography_bold}>Project</Form.Label>
                    <Form.Select className={pageStyles.form_input} onChange={onProjectChange} value={project}>
                        {userProjects}
                    </Form.Select>
                </Form.Group>
                <Form.Group controlId="formDocumentTitle" className="mb-3">
                    <Form.Label className={styles.typography_bold}>Document Title</Form.Label>
                    <Form.Control className={pageStyles.form_input} type="text" placeholder="Enter title"
                                  onChange={onTitleChange} value={title} />
                </Form.Group>
                <Form.Group controlId="formDocumentText" className="mb-3">
                    <Form.Label className={styles.typography_bold}>Document Text</Form.Label>
                    <Form.Control className={pageStyles.form_textarea} type="text" placeholder="Enter text"
                                  as={'textarea'} rows={11} onChange={onTextChange} value={text} />
                </Form.Group>
                <Button className={pageStyles.submit_button} type="submit" variant="outline-dark">Submit</Button>
            </Form>
            {invalidDetails !== "" && (
                <p className={`${pageStyles.error_message} ${styles.animated_panel}`}>{invalidDetails}</p>
            )}
            {error && (
                <div className={pageStyles.error_message}>
                    <FetchMessage data={response} error={error.status} title="Create Document" styleEnabled={true} />
                </div>
            )}
            <Modal
                show={showModal}
                onHide={handleClose}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Document Successfully Created
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Document Title: {response?.name}</p>
                    <p>Time Created: {moment(response?.timestamp).format('DD/MM/YYYY HH:mm:ss')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => {
                        if (response && response?.project_id.toString() !== "" && response?.id.toString() !== "") {
                            searchParams.set("project", response.project_id.toString());
                            searchParams.set("document", response.id.toString());
                        }
                        navigateTo("/browser", searchParams, history);
                    }}>View document in browser</Button>
                    <Button variant="outline-dark" onClick={() => {
                        setProject("");
                        setTitle("");
                        setText("");
                        handleClose();
                    }}>
                        Create another document
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default DocumentAdd;