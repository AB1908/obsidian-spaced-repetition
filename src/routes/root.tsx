import React, { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ICON_LIST } from "src/constants";
import { setIcon } from "obsidian";

export type Icon = typeof ICON_LIST[number];

export function Root({ handleCloseButton }: { handleCloseButton: () => void }) {
    const backButton = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const back: Icon = "arrow-left";
        //todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(backButton.current, back);
        navigate("/books");
        console.log("here")
    }, []);

    function onClick() {
        if (!((location.pathname === "/books") || (location.pathname === "/tabs"))) {
            navigate(-1);
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
            Card Coverage
            </div>
            <div className={"modal-content sr-modal-content"}>
                <Outlet />
            </div>
        </>
    );
}