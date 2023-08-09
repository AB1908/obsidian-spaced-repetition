import React, {useEffect} from "react";
import {Outlet, useNavigate} from "react-router";
import {NavLink} from "react-router-dom";
import {ICON_LIST} from "src/constants";
import {ModalContent} from "src/ui/views/modal";

export type Icon = typeof ICON_LIST[number];

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    const backButton = useRef();
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/home/books");
        const back: Icon = 'arrow-left';
        setIcon(backButton.current, back);
    }, []);

    function onClick () {
        if ((location.pathname === '/home/books') || (location.pathname === '/home/tabs')) {

        } else {
            navigate(-1);
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
                <NavLink to="/home/tags" className={"sr-nav-link is-clickable"} >
                    Tags
                </NavLink>
                <NavLink to="/home/books" className={"sr-nav-link is-clickable"}>
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