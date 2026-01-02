import React, { useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "src/types/obsidian-icons";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { useModalTitle } from "src/ui/modals/ModalTitleContext";

export function Root({ handleCloseButton }: { handleCloseButton: () => void }) {
    const backButton = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { modalTitle } = useModalTitle();

    useEffect(() => {
        const back: Icon = "arrow-left";
        // todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(backButton.current, back);
        navigate("/books");
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
                {modalTitle}
            </div>
            <div className={"modal-content sr-modal-content"}>
                <Outlet />
            </div>
        </>
    );
}