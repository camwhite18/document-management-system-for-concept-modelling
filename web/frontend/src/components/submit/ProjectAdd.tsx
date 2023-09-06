import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "../../state/hooks";
import { navigateTo, useSearchParams } from "../../services/utils";
import { rebuild } from "../../utils/tooltip";
import { createProject, createPermissionsMap, CreatedProjectResponse } from "../../services/submit";
import { APIError } from "../../services/apiError";
import FetchMessage from "../alerts/FetchMessage";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Modal from "react-bootstrap/Modal";
import pageStyles from "./SubmitPage.module.css";
import styles from "../../css/main.module.css";
import moment from "moment";

const nonePerms = "none";
const readPerms = "read";
const writePerms = "write";
const customPerms = "custom";

const ProjectAdd = () => {
    const canCreateProjects = useSelector(state => state.user.create_projects);
    const searchParams = useSearchParams();
    const history = useNavigate();

    const [name, setName] = useState("");
    const [permissionType, setPermissionType] = useState<string>(nonePerms);
    const [customPermissionValue, setCustomPermissionValue] = useState<string>("");
    const [showCustomPerms, setShowCustomPerms] = useState<boolean>(false);
    const [response, setResponse] = useState<CreatedProjectResponse>();
    const [error, setError] = useState<APIError>();
    const [invalidDetails, setInvalidDetails] = useState<string>("");
    const [showModal, setShowModal] = useState<boolean>(false);

    const onNameChange = ({target:{value}}: any) => setName(value);
    const onPermsChange = (id: string) => setPermissionType(id);
    const onCustomPermsChange = ({target:{value}}: any) => setCustomPermissionValue(value);
    const onCustomPermsSelect = () => setShowCustomPerms(true);
    const onOtherPermsSelect = () => setShowCustomPerms(false);

    useEffect(() => {
        rebuild();
    }, []);

    const formSubmit = (event: any) => {
        event.preventDefault();
        setInvalidDetails("")
        setError(undefined)
        if (name === "" || (permissionType === customPerms && customPermissionValue === "")) {
            setInvalidDetails("Please fill in all fields")
            return;
        }
        const permissionsMap = createPermissionsMap(customPermissionValue)
        if (permissionType === customPerms && Object.keys(permissionsMap).length === 0) {
            setInvalidDetails("Custom permissions must be in the format '<username>:<r/w>,<username>:<r/w>'")
            return;
        }
        createProject(name, permissionType, permissionsMap).then((result) => {
            setResponse(result)
            setShowModal(true);
        }).catch((error) => {
            setError(error);
        });
    }

    return (
        <>
            {!canCreateProjects ? (
                <p>
                    You do not have permission to create projects. Please contact an administrator to gain access.
                </p>
            ) : (
                <Form onSubmit={formSubmit}>
                    <Form.Group controlId="formProjectName" className="mb-3">
                        <Form.Label className={styles.typography_bold}>Project Name</Form.Label>
                        <Form.Control className={pageStyles.form_input} type="text" placeholder="Enter name"
                                      onChange={onNameChange} value={name} />
                    </Form.Group>
                    <Form.Group controlId="formPermissions" className="mb-3">
                        <Form.Label className={styles.typography_bold}>
                            Permissions <InfoOutlinedIcon
                            data-tip={"Caution: once permissions for a project are set, they can only be changed by an administrator"}
                            fontSize="small" />
                        </Form.Label>
                        <Form.Check defaultChecked id={nonePerms} type="radio" name="permGroup"
                                    label="Give no other users read/write permissions" onClick={onOtherPermsSelect}
                                    onChange={() => onPermsChange(nonePerms)} value={permissionType} />
                        <Form.Check id={readPerms} type="radio" name="permGroup" label="Give all other users read permissions"
                                    onClick={onOtherPermsSelect} onChange={() => onPermsChange(readPerms)} value={permissionType} />
                        <Form.Check id={writePerms} type="radio" name="permGroup" label="Give all other users write permissions"
                                    onClick={onOtherPermsSelect} onChange={() => onPermsChange(writePerms)} value={permissionType} />
                        <Form.Check id={customPerms} type="radio" name="permGroup" label="Custom permissions for other users"
                                    onClick={onCustomPermsSelect} onChange={() => onPermsChange(customPerms)} value={permissionType} />
                        {showCustomPerms && (
                            <>
                                <Form.Control className={pageStyles.perms_input} type="text" placeholder="Enter permissions
                                as <username>:<r/w>,<username>:<r/w>,..." onChange={onCustomPermsChange}
                                              value={customPermissionValue} />
                                <Form.Label className={pageStyles.hint_text}>
                                    e.g. user1:r,user2:w,user3:r</Form.Label>
                            </>
                        )}
                    </Form.Group>
                    <Button className={pageStyles.submit_button} type="submit" variant="outline-dark">Submit</Button>
                </Form>
            )}
            {invalidDetails !== "" && (
                <p className={`${pageStyles.error_message} ${styles.animated_panel}`}>{invalidDetails}</p>
            )}
            {error && (
                <div className={pageStyles.error_message}>
                    <FetchMessage data={response} error={error.status} title="Create Project" styleEnabled={true} />
                </div>
            )}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Project Successfully Created
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Project Name: {response?.name}</p>
                    <p>Time Created: {moment(response?.timestamp).format('DD/MM/YYYY HH:mm:ss')}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-dark" onClick={() => {
                        if (response && response?.id.toString() !== "") {
                            searchParams.set("project", response.id.toString());
                            searchParams.delete("document");
                        }
                        navigateTo("/browser", searchParams, history);
                    }}>
                        View project in browser
                    </Button>
                    <Button variant="outline-dark" onClick={() => {
                        setName("");
                        setPermissionType(nonePerms);
                        setCustomPermissionValue("");
                        setShowModal(false);
                    }}>
                        Create another project
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ProjectAdd