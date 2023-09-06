import { FunctionComponent } from "react";
import {protectedRoutes, routes} from "../../variables/routes";
import NavItem from "./NavItem";
import styles from "./HeaderNavList.module.css"

const HeaderNavList: FunctionComponent = () => {
    return (
        <div className={styles.header_nav_list}>
            {routes.map((route) => {
                return <NavItem key={route.path} to={route.path} label={route.name} />;
            })}
            {protectedRoutes.map((route) => {
                return <NavItem key={route.path} to={route.path} label={route.name} />;
            })}
        </div>
    );
};

export default HeaderNavList;
