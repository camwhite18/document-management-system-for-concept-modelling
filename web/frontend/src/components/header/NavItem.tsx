import { FunctionComponent } from "react";
import { NavLink } from "react-router-dom";
import styles from "../../css/main.module.css";
import navItemStyles from "./NavItem.module.css";

interface NavItemProps {
    to: string;
    label: string;
}

const NavItem: FunctionComponent<NavItemProps> = ({ to, label }: NavItemProps) => {
    return (
        <NavLink
            className={navItemStyles.nav_list_item}
            to={{ pathname: to, search: "" }}
            data-testid={`navItemLink${label}`}>
            <a>
                <span className={`${navItemStyles.nav_list_item_content} ${styles.typography_body_md} 
                ${styles.typography_bold}`} data-testid="navItemLabel">{label}</span>
            </a>
        </NavLink>
    );
};

export default NavItem;
