import React, {useEffect, useRef} from "react";
import {Outlet, redirect, useNavigate} from "react-router-dom";
import {NavLink, useLocation} from "react-router-dom";
import {ICON_LIST} from "src/constants";
import {setIcon} from "obsidian";

export type Icon = typeof ICON_LIST[number];

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    const backButton = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/books");
        const back: Icon = 'arrow-left';
        setIcon(backButton.current, back);
    }, []);

    function onClick () {
        if ((location.pathname === '/books') || (location.pathname === '/tabs')) {

        } else {
            // navigate(-1);
            navigate("./..")
        }
    }

    return (
        <>
            <div className={"modal-back-button"} onClick={onClick} ref={backButton}>
            </div>
            <div
                className={"modal-close-button"}
                onClick={() => handleCloseButton()}
            />
            <div className={"modal-title"}>
                Spaced Repetition
            </div>
            <div className={"modal-content sr-modal-content"}>
                <Outlet/>
            </div>
        </>
    );
}

export function Tabs() {
    return (
        <>
            <div className={"sr-tab-nav"}>
                <NavLink to="/tags" className={"sr-nav-link is-clickable"} >
                    Tags
                </NavLink>
                <NavLink to="/books" className={"sr-nav-link is-clickable"}>
                    Notes
                </NavLink>
            </div>
            <Outlet/>
        </>
    );
};

export function Tags() {
    return <p>WIP</p>
}