import React, { createContext, useContext, useState, ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getBreadcrumbData } from "src/api";

interface ModalTitleContextType {
    modalTitle: string;
    setModalTitle: (title: string) => void;
}

const ModalTitleContext = createContext<ModalTitleContextType | undefined>(undefined);

export const ModalTitleProvider = ({ children }: { children: ReactNode }) => {
    const [modalTitle, setModalTitle] = useState("Card Coverage");
    const { bookId, sectionId } = useParams();

    // Initial title setup based on URL params
    React.useEffect(() => {
            if (bookId) {
                try {
                    const { bookName, sectionName } = getBreadcrumbData(bookId, sectionId);
                    let title = bookName;
                    if (sectionName) {
                        title += ` / ${sectionName}`;
                    }
                    setModalTitle(title);
                } catch (e) {
                    console.error("Error setting initial modal title:", e);
                    setModalTitle("Card Coverage"); // Fallback title
                }
            } else {
                setModalTitle("Card Coverage");
            }
    }, [bookId, sectionId]);

    return (
        <ModalTitleContext.Provider value={{ modalTitle, setModalTitle }}>
            {children}
        </ModalTitleContext.Provider>
    );
};

export const useModalTitle = () => {
    const context = useContext(ModalTitleContext);
    if (context === undefined) {
        throw new Error("useModalTitle must be used within a ModalTitleProvider");
    }
    return context;
};
