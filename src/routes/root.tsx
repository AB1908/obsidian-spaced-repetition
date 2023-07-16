import React, {useEffect} from "react";
import {Outlet, useNavigate} from "react-router";
import {NavLink} from "react-router-dom";
import {ICON_LIST} from "src/constants";
import {ModalContent} from "src/ui/views/modal";

export type Icon = typeof ICON_LIST[number];

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/home/notes");
    }, []);

    return (
        <>
            <div
                className={"modal-close-button"}
                onClick={() => handleCloseButton()}
            />
            <div className={"modal-title"}>
                Spaced Repetition
            </div>
            <div
                className={"modal-content sr-modal-content"}
            >
                <Outlet/>
            </div>
        </>
    );
}

export function Tabs() {
    return (
        <>
            <div className={"sr-tab-nav"}>
                <NavLink to="/home/tags" className={"sr-nav-link is-clickable"} >
                    Tags
                </NavLink>
                <NavLink to="/home/notes" className={"sr-nav-link is-clickable"}>
                    Notes
                </NavLink>
            </div>
            <Outlet/>
        </>
    );
};

export function Tags() {
    return <ModalContent/>
}