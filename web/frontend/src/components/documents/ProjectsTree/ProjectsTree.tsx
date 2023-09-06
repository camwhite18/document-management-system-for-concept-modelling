import React, { FunctionComponent, useEffect, useState } from "react";
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import FolderIcon from '@mui/icons-material/Folder';
import ArticleIcon from '@mui/icons-material/Article';
import styles from "../../../css/main.module.css";
import pageStyles from "./ProjectsTree.module.css";
import { getProjects, Project } from "../../../services/documents";
import { APIError } from "../../../services/apiError";
import { navigateTo, useSearchParams } from "../../../services/utils";
import { useLocation, useNavigate, useNavigationType } from "react-router-dom";
import FetchMessage from "../../alerts/FetchMessage";
import { Skeleton } from "@mui/material";
import Chip from '@mui/material/Chip';
import { useSelector } from "../../../state/hooks";

function styledTreeLabel(icon: JSX.Element, label: string, permission?: string) {
    return (
        <div className={pageStyles.tree_item}>
            {icon}
            <div>{label}</div>
            {permission && <Chip label={permission.slice(0,1)} size="small" />}
        </div>
    );
}


const ProjectsTree: FunctionComponent = () => {
    const [tree, setTree] = useState<Project[]>();
    const [error, setError] = useState<APIError>();
    const [noData, setNoData] = useState<string>();
    const searchParams = useSearchParams();
    const paramProject = "project";
    const paramDocument = "document";
    const [selectedKey, setSelectedKey] = useState<string>(searchParams.get(paramProject) ? "project-"+searchParams.get(paramProject) : "");
    const [expandedKey, setExpandedKey] = useState<string[]>(searchParams.get(paramProject) ? ["project-"+searchParams.get(paramProject)] : []);
    const history = useNavigate();
    const navType = useNavigationType();
    const location = useLocation();
    const userProjectPermissions = useSelector((state) => state.user.project_permissions);


    useEffect(() => {
        if (!tree) {
            fetchDataAndCreateTree();
        } else if (navType === "POP") {
            setExpandedAndSelected();
        }
    }, [searchParams.get(paramProject), searchParams.get(paramDocument)]);

    function setExpandedAndSelected() {
        if (searchParams.get(paramProject) && searchParams.get(paramDocument)) {
            setSelectedKey("document-"+searchParams.get(paramDocument));
            setExpandedKey(
                expandedKey.includes("project-"+searchParams.get(paramDocument)) ?
                    expandedKey :
                    expandedKey.concat("project-"+searchParams.get(paramDocument))
            );
        } else if (searchParams.get(paramProject)) {
            setSelectedKey("project-"+searchParams.get(paramProject));
        }
    }

    function fetchDataAndCreateTree() {
        // fetch all projects
        getProjects().then((result: Project[]) => {
            if (result && result.length > 0){
                setTree(result);
                setExpandedAndSelected();
            } else {
                setNoData("No projects found.");
            }
        }).catch((error: APIError) => {
            setError(error);
            setTree(undefined);
            setNoData(undefined);
        });
    }

    function handleUpdateParam(param: string, value: string) {
        if (value !== searchParams.get(param)) {
            searchParams.set(param, value);
            if (param === paramProject) {
                searchParams.delete(paramDocument);
            }
            navigateTo(location.pathname, searchParams, history);
        }
    }

    function createTree() {
        if (tree) {
            return tree.map((project: Project) => {
                return (
                    <TreeItem
                        nodeId={"project-"+project.id.toString()}
                        data-testid={"project"}
                        label={styledTreeLabel(<FolderIcon />, project.name, userProjectPermissions[project.id])}
                        onClick={() => {
                            handleUpdateParam(paramProject, project.id.toString());
                            setExpandedAndSelected();
                            setExpandedKey(
                                expandedKey.includes("project-"+project.id.toString()) ?
                                    expandedKey.filter((k) => k !== "project-"+project.id.toString()) :
                                    expandedKey.concat("project-"+project.id.toString())
                            );
                        }}
                    >
                        {project.documents.map((document) => {
                            return (
                                <TreeItem
                                    nodeId={"document-"+document.id.toString()}
                                    data-testid={"document"}
                                    label={styledTreeLabel(<ArticleIcon />, document.name)}
                                    onClick={() => {
                                        handleUpdateParam(paramProject, project.id.toString());
                                        handleUpdateParam(paramDocument, document.id.toString());
                                    }}
                                />
                            );
                        })}
                    </TreeItem>
                );
            })
        }
    }

    function createSkeleton() {
        const skeleton = [];
        for (let i = 0; i < 100; i++) {
            skeleton.push(
                <Skeleton data-testid="skeleton" variant="text" sx={{ fontSize: '1.2rem' }}/>
            );
        }
        return skeleton;
    }

    return (
        <>
            {tree && (
                <TreeView
                    data-testid="tree"
                    className={`${pageStyles.tree} ${styles.animated_panel}`}
                    aria-label="display projects and documents"
                    style={{height: "100%"}}
                    defaultCollapseIcon={<ArrowDropDownIcon />}
                    defaultExpandIcon={<ArrowRightIcon />}
                    expanded={expandedKey}
                    selected={selectedKey}
                    sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
                >
                    {tree ? createTree() : <div>{noData}</div>}
                </TreeView>
            )}
            {noData && (
                <div className={pageStyles.no_tree_data} data-testid="no-data">{noData}</div>
            )}
            {error && (
                <div className={pageStyles.error_message} data-testid="error">
                    <FetchMessage data={tree} error={error.status} title="Tree" styleEnabled={true} />
                </div>
            )}
            {!tree && !noData && !error && (
                <div className={`${pageStyles.skeleton} ${styles.animated_panel}`}>
                    {createSkeleton()}
                </div>
            )}
        </>
    );
}

export default ProjectsTree;