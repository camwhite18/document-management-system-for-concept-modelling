import { FunctionComponent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { defaultRoutePath } from "../../variables/routes";
import { navigateTo, useSearchParams } from "../../services/utils";
import styles from "../../css/main.module.css";
import Button from "react-bootstrap/Button";

const NoMatch: FunctionComponent = () => {
    const location = useLocation().pathname;
    const history = useNavigate();
    const searchParams = useSearchParams();

    return (
        <div className={styles.container}>
            <h1 className={styles.typography_heading_md}>International Relations NER</h1>
            <br />
            <div>
                <h4 className={styles.typography_heading_sm}>404 - We couldn&apos;t find this page</h4>
                {location !== "404" && <p className={styles.typography_body_md}>URL: {location}</p>}
                <Button
                    variant="outline-dark"
                    onClick={() => {
                        navigateTo(defaultRoutePath, searchParams, history);}
                }>
                    Return Home
                </Button>{" "}

            </div>
        </div>
    );
};

export default NoMatch;
