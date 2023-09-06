import { FunctionComponent } from "react";
import Dropdown from 'react-bootstrap/Dropdown';
import styles from "./HeaderAvatarMenu.module.css";
import accountCircle from "../../css/images/accountCircle.svg";
import { useDispatch, useSelector } from "../../state/hooks";
import { persistor } from "../../state/store";
import { navigateTo, useSearchParams } from "../../services/utils";
import { defaultRoutePath } from "../../variables/routes";
import { useNavigate } from "react-router-dom";
import { authFlush } from "../../state/authSlice";
import { userFlush } from "../../state/userSlice";

const HeaderAvatarMenu: FunctionComponent = () => {
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const history = useNavigate();
    const username = useSelector((state) => state.user.username);

    return (
        <Dropdown>
            <Dropdown.Toggle className={`${styles.avatar_button} ${styles.show}`}>
                <img className="avatar" src={accountCircle} alt="User Avatar" />
            </Dropdown.Toggle>
            {username !== undefined ? (
                <Dropdown.Menu>
                    <Dropdown.ItemText>{username}</Dropdown.ItemText>
                    <Dropdown.Item className={styles.dropdown_item} href={"#/settings"}>Settings</Dropdown.Item>
                    <Dropdown.Item className={styles.dropdown_item}
                                   onClick={() => {
                                        dispatch(userFlush())
                                        dispatch(authFlush())
                                        persistor.flush()
                                            .then(() => {
                                            navigateTo(defaultRoutePath, searchParams, history)
                                            })
                                   }
                    }
                    >Logout</Dropdown.Item>
                </Dropdown.Menu>
            ) : (
                <Dropdown.Menu>
                    <Dropdown.Item className={styles.dropdown_item} href={"#/login"}>Login</Dropdown.Item>
                </Dropdown.Menu>
            )}

        </Dropdown>
    );
};

export default HeaderAvatarMenu;
