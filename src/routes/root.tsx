import React, {useEffect, useRef} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {ICON_LIST} from "src/constants";
import {setIcon} from "obsidian";

export type Icon = typeof ICON_LIST[number];

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    const backButton = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const back: Icon = "arrow-left";
        //todo: figure out how to fix this
        //@ts-ignore
        setIcon(backButton.current, back);
        navigate("/books");
    }, []);

    function onClick () {
        if ((location.pathname === "/books") || (location.pathname === "/tabs")) {
        } else {
            navigate(-1);
            // navigate("./..")
        }
    }

    return (
        <>
            <div className={"modal-back-button"} onClick={() => onClick()} ref={backButton}>
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

