import React, { FunctionComponent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/main.module.css";
import loginPageStyles from "./LoginPage.module.css"
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { useDispatch, useSelector } from "../../state/hooks";
import { defaultRoutePath } from "../../variables/routes";
import { navigateTo, useSearchParams } from "../../services/utils";
import { getTokens, Tokens } from "../../services/auth";
import { authUpdated } from "../../state/authSlice";
import { fetchUser } from "../../state/userSlice";
import { APIError } from "../../services/apiError";
import FetchMessage from "../alerts/FetchMessage";

const LoginPage: FunctionComponent = () => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const history = useNavigate();
    const username = useSelector((state) => state.user.username);

    const [usernameVal, setUsernameVal] = useState<string>("");
    const [passwordVal, setPasswordVal] = useState<string>("");
    const [tokens, setTokens] = useState<Tokens>();
    const [error, setError] = useState<APIError>();

    const onUsernameChange = ({target:{value}}: any) => setUsernameVal(value);
    const onPasswordChange = ({target:{value}}: any) => setPasswordVal(value);

    const formSubmit = (event: any) => {
        event.preventDefault();
        setError(undefined)
        getTokens({username: usernameVal, password: passwordVal})
            .then((tokens) => {
                setTokens(tokens);
            })
            .catch((error: APIError) => {
                setError(error);
            });
    }

    useEffect(() => {
        if (username !== undefined) {
            navigateTo(defaultRoutePath, searchParams, history);
        }
    }, []);

    useEffect(() => {
        if (tokens !== undefined) {
            dispatch(authUpdated(tokens));
            dispatch(fetchUser());
            navigateTo(defaultRoutePath, searchParams, history);
        }
    }, [tokens]);

    return (
        <div className={`${styles.container} ${loginPageStyles.center_container}`}>
            <h1 className={styles.typography_heading_md}>Enter your username and password</h1>
            <br />
            <Form onSubmit={formSubmit}>
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextUsername">
                    <Form.Label column sm="2" className={loginPageStyles.form_label}>
                        Username:
                    </Form.Label>
                    <Col className={loginPageStyles.input_container} sm="10">
                        <Form.Control placeholder="Username" onChange={onUsernameChange} value={usernameVal} />
                    </Col>
                </Form.Group>
                <Form.Group as={Row} className="mb-3" controlId="formPlaintextPassword">
                    <Form.Label column sm="2" className={loginPageStyles.form_label}>
                        Password:
                    </Form.Label>
                    <Col className={loginPageStyles.input_container} sm="10">
                        <Form.Control type="password" placeholder="Password" onChange={onPasswordChange} value={passwordVal} />
                    </Col>
                </Form.Group>
                <div className={loginPageStyles.login_container}>
                    <Button type="submit" variant="outline-dark" className={loginPageStyles.login_button}>Login</Button>
                </div>
            </Form>
            <div className={`${styles.typography_body_md} ${loginPageStyles.form_text}`}>
                If you have forgotten your password then contact an administrator.
            </div>
            {error && ((error.status === 400 || error.status === 401 || error.status === 403) ? (
                <div className={loginPageStyles.error_message}>
                    Invalid username or password.
                </div>
            ) : (
                <div className={loginPageStyles.error_message}>
                    <FetchMessage data={tokens} error={error.status} title="Login" styleEnabled={true} />
                </div>
            ))}
        </div>
    );
};

export default LoginPage;