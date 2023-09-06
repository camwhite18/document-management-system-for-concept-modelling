import { FunctionComponent } from "react";
import HeaderNavList from "./HeaderNavList";
import styles from "../../css/main.module.css"
import headerStyles from "./Header.module.css";
import irLogo from "../../css/images/irLogo.svg";
import HeaderAvatarMenu from "./HeaderAvatarMenu";
import { defaultRoutePath } from "../../variables/routes";

const Header: FunctionComponent = () => {
    return (
        <header>
            <div className={headerStyles.header_container}>
                <div className={headerStyles.nav_container}>
                    <div className={headerStyles.name_logo_container}>
                        <a href={defaultRoutePath}>
                            <img className={`${headerStyles.header_img}`} src={irLogo} alt="IR NER Logo" />{" "}
                        </a>
                        <div className={headerStyles.title_container}>
                            <div className={`${styles.typography_heading_sm} ${styles.typography_bold} ${headerStyles.header_name_1}`}>
                                International Relations&nbsp;
                            </div>
                            <div className={`${styles.typography_heading_sm} ${styles.typography_bold} ${headerStyles.header_name_2}`}>
                                Named Entity Recognition
                            </div>
                        </div>
                    </div>
                    <div className={headerStyles.nav_list}>
                        <HeaderNavList />
                    </div>
                </div>
                <div className={headerStyles.avatar_container}>
                    <HeaderAvatarMenu />
                </div>
            </div>
        </header>
    );
};

export default Header;
