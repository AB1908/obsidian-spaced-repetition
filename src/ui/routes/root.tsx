import React, { useEffect, useRef } from "react";
import { Outlet, UIMatch, useLocation, useMatches, useNavigate } from "react-router-dom";
import { Icon } from "src/types/obsidian-icons";
import { setIcon } from "src/infrastructure/obsidian-facade";

const DEFAULT_MODAL_TITLE = "Card Coverage";

type ModalTitleHandle = {
    title?: (match: UIMatch) => string | undefined;
}

function resolveTitle(matches: UIMatch[]): string {
    for (let index = matches.length - 1; index >= 0; index--) {
        const match = matches[index];
        const handle = match.handle as ModalTitleHandle | undefined;
        if (typeof handle?.title !== "function") {
            continue;
        }

        try {
            const title = handle.title(match);
            if (typeof title === "string" && title.length > 0) {
                return title;
            }
        } catch {
            // Ignore malformed route handle titles and continue up the match chain.
        }
    }

    return DEFAULT_MODAL_TITLE;
}

export function Root({ handleCloseButton }: { handleCloseButton: () => void }) {
    const backButton = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const matches = useMatches();
    const modalTitle = resolveTitle(matches);

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
