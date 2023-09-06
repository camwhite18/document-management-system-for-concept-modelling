import { FunctionComponent } from "react";
import styles from "../../css/main.module.css";
import pageStyles from "./SubmitPage.module.css";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import DocumentAdd from "./DocumentAdd";
import ProjectAdd from "./ProjectAdd";


const SubmitPage: FunctionComponent = () => {
    return (
        <div className={`${styles.container} ${pageStyles.tabs}`}>
            <h1 className={styles.typography_heading_md}>Submit Documents</h1>
            <br />
            <Tabs
                className={styles.animated_panel}
                defaultActiveKey="document"
                justify
            >
                <Tab tabClassName={pageStyles.tab_title} eventKey="document" title="Create Document">
                    <DocumentAdd />
                </Tab>
                <Tab tabClassName={pageStyles.tab_title} eventKey="project" title="Create Project">
                    <ProjectAdd />
                </Tab>
            </Tabs>
        </div>
    );
};

export default SubmitPage;