import {useEffect, useState} from "react";
import {getUser} from "../services/user";
import {navigateTo, useSearchParams} from "../services/utils";
import {useNavigate} from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {defaultRoutePath, routeLogin} from "./routes";
import {useSelector} from "../state/hooks";


export const ProtectedRoute = (props: any) => {
    const searchParams = useSearchParams();
    const history = useNavigate();
    const [user, setUser] = useState(useSelector((state) => state.user.username));

    useEffect(() => {
        if (user === undefined) {
            getUser().then((result) => {
                if (result) {
                    setUser(result.username);
                }
            });
        }
    }, []);

    return (
        <>
            {user !== undefined ? props.children : (
                <Modal
                    show={true}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header>
                        <Modal.Title id="contained-modal-title-vcenter">
                            Login Required
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>
                            You must be logged in to view this page.
                        </p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-dark" onClick={() => {
                            navigateTo(defaultRoutePath, searchParams, history);
                        }}>Go to Home</Button>
                        <Button variant="outline-dark" onClick={() => {
                            navigateTo(routeLogin.path, searchParams, history);
                        }}>Go to Login</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
}