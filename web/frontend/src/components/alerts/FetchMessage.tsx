import React, { FunctionComponent } from "react";
import { Fragment } from "react";
import styles from "../../css/main.module.css";
import { getHttpResponseMessage } from "../../services/statusCodes";

type FetchMessageProps = {
    data: any;
    title: string;
    error: number | undefined;
    styleEnabled: boolean;
};

const FetchMessage:FunctionComponent<FetchMessageProps> = ({data,title,error, styleEnabled}: FetchMessageProps) => {

    const messageStyle = `oj-sm-padding-4x ${styles.border_top_all_except_first}`;
    const errorMessage = getHttpResponseMessage(error);

    const message =
        data === null ? `Loading ${title}...` :
            data === undefined && error ? `[${error}] ${title} - ${errorMessage}!` :
                data?.length === 0 ? `You don't have permission to view ${title}!` : null;

    return (
        <Fragment>
            {message &&
                <div className={`${styles.animated_panel} oj-flex ${styleEnabled && messageStyle}`}>
                    <span>{message}</span>
                </div>}
        </Fragment>
    );
};

export default FetchMessage;
