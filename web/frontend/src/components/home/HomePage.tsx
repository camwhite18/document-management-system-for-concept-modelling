import React, {FunctionComponent, useEffect, useState} from "react";
import styles from "../../css/main.module.css";
import homeStyles from "./HomePage.module.css";
import { useSelector } from "../../state/hooks";
import Button from "react-bootstrap/Button";
import { navigateTo, useSearchParams } from "../../services/utils";
import { routeLogin } from "../../variables/routes";
import { useNavigate } from "react-router-dom";
import ListGroup from 'react-bootstrap/ListGroup';
import { getEvents, Event } from "../../services/events";
import moment from "moment";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { rebuild } from "../../utils/tooltip";


const HomePage: FunctionComponent = () => {
    const history = useNavigate();
    const searchParams = useSearchParams();
    const username = useSelector((state) => state.user.username);
    const [events, setEvents] = useState<Event[]>([]);
    const [error, setError] = useState<Error>();
    const [noData, setNoData] = useState<string>();

    useEffect(() => {
        rebuild();
        if (username === undefined) {
            return;
        }
        getEvents().then((result) => {
            if (result && result.length > 0) {
                setEvents(result);
            } else {
                setNoData("No recent activity found");
            }
        }).catch((error) => {
            setError(error);
        })
    }, [username])

    function createListRow(event: Event) {
        return (
            <ListGroup.Item className={homeStyles.list_item}>
                <p>{event?.action.charAt(0).toUpperCase() + event?.action.slice(1)} {event?.type}: {event?.name}</p>
                <div className={homeStyles.list_item}>
                    <p>Time: {moment(event?.timestamp).format('DD/MM/YYYY HH:mm:ss')}</p>
                    <Button variant="outline-dark" onClick={() => {
                        if (event?.project_id !== null && event?.document_id !== null) {
                            searchParams.set("project", event.project_id.toString());
                            searchParams.set("document", event.document_id.toString());
                        } else if (event?.project_id !== null) {
                            searchParams.set("project", event.project_id.toString());
                        }
                        navigateTo("/browser", searchParams, history);
                    }}>View in browser</Button>
                </div>
            </ListGroup.Item>
        )
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.typography_heading_md}>Welcome to the International Relations NER Tool</h1>
            <br />
            {username === undefined ? (
                <>
                    <p className={styles.typography_body_md}>Please log in to use the tool.</p>
                    <Button
                        data-testid="login-button"
                        className={`mb-2 ${homeStyles.button_width}`}
                        variant="outline-dark"
                        onClick={() => {
                            navigateTo(routeLogin.path, searchParams, history);}
                        }>
                        Login Here
                    </Button>{" "}
                    <p className={styles.typography_body_md}>If you do not have an account, please contact your administrator.</p>
                </>
            ) : (
                <>
                    <p className={styles.typography_body_lg}>Hello, {username}!</p>
                    <p className={styles.typography_body_md}>Recent activity <InfoOutlinedIcon
                        data-tip={"If you have deleted a project or document, it will no longer appear here."}
                        fontSize="small" /></p>
                    <ListGroup className={styles.animated_panel}>
                        {events.length > 0 && events.map((event: Event) => {
                            return (
                                createListRow(event)
                            )
                        })}
                        {noData && <ListGroup.Item>{noData}</ListGroup.Item>}
                        {error && <ListGroup.Item>{error.message}</ListGroup.Item>}
                        {events.length === 0 && !noData && !error && <ListGroup.Item>Loading...</ListGroup.Item>}
                    </ListGroup>
                </>
            )}
        </div>
    )
};

export default HomePage;
