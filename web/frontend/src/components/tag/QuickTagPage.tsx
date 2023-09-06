import React, { FunctionComponent, useState } from "react";
import styles from "../../css/main.module.css";
import pageStyles from "./QuickTagPage.module.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { performTag, TaggedDocument } from "../../services/tag";
import { APIError } from "../../services/apiError";
import FetchMessage from "../alerts/FetchMessage";
import parse from "html-react-parser";
import { Spinner } from "react-bootstrap";


const QuickTagPage: FunctionComponent = () => {
    const [text, setText] = useState<string>("");
    const [tagResult, setTagResult] = useState<TaggedDocument>();
    const [error, setError] = useState<APIError>();
    const [loading, setLoading] = useState<boolean>(false);
    const [emptyField, setEmptyField] = useState<boolean>(false);

    const onTextChange = ({target:{value}}: any) => setText(value);

    const formSubmit = (event: any) => {
        event.preventDefault();
        setEmptyField(false)
        if (text === "") {
            setEmptyField(true);
            return;
        }
        setTagResult(undefined);
        setLoading(true)
        setError(undefined)
        performTag(text).then((result) => {
            setLoading(false)
            setTagResult(result);
        }).catch((error) => {
            setLoading(false)
            setError(error);
        });
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.typography_heading_md}>Quick Tag</h1>
            <br />
            <Form onSubmit={formSubmit} className={styles.animated_panel}>
                <Form.Group controlId="formText" className="mb-3">
                    <Form.Label className={styles.typography_body_md}>Input Text</Form.Label>
                    <Form.Control className={pageStyles.input_text} type="text" placeholder="Enter text"
                                  as={'textarea'} rows={8} onChange={onTextChange} value={text} />
                </Form.Group>
                <Button className={pageStyles.submit_button} type="submit" variant="outline-dark">Submit</Button>
            </Form>
            {emptyField && (
                <p className={pageStyles.error_message}>Please fill in the text field</p>
            )}
            {loading && (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}
            {tagResult && (
                <Form.Group controlId="formText" className={`mb-3 ${styles.animated_panel}`}>
                    <Form.Label className={styles.typography_body_md}>Tagged Text</Form.Label>
                    <div className={styles.tagged_text}>
                        {parse(tagResult?.tagged_text)}
                    </div>
                </Form.Group>
            )}
            {error && (
                <div className={pageStyles.error_message} data-testid="error">
                    <FetchMessage data={tagResult} error={error.status} title="Tag" styleEnabled={true} />
                </div>
            )}
        </div>
    );
};

export default QuickTagPage;