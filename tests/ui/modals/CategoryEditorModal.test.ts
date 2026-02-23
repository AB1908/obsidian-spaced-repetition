import { waitFor } from "@testing-library/dom";
import type { CategoryConfig } from "src/config/annotation-categories";
import { CategoryEditorModal } from "src/ui/modals/CategoryEditorModal";

const setIconMock = jest.fn((el: HTMLElement, icon: string) => {
    el.setAttribute("data-icon", icon);
});

jest.mock("src/infrastructure/obsidian-facade", () => {
    class MockModal {
        app: any;
        contentEl: HTMLDivElement;
        modalEl: HTMLDivElement;

        constructor(app: any) {
            this.app = app;
            this.contentEl = document.createElement("div");
            this.modalEl = document.createElement("div");
        }

        open() {
            return (this as any).onOpen?.();
        }

        close() {
            return (this as any).onClose?.();
        }
    }

    return {
        Modal: MockModal,
        setIcon: (...args: [HTMLElement, string]) => setIconMock(...args),
    };
});

describe("CategoryEditorModal", () => {
    const initialCategories: CategoryConfig[] = [
        { name: "insight", icon: "lightbulb" as any },
        { name: "quote", icon: "quote" as any },
    ];

    beforeEach(() => {
        setIconMock.mockClear();
        jest.restoreAllMocks();
    });

    function createModal(overrides?: {
        onSave?: jest.Mock<Promise<void>, [CategoryConfig[]]>;
        getOrphanCount?: jest.Mock<number, [string]>;
    }) {
        const onSave = overrides?.onSave ?? jest.fn().mockResolvedValue(undefined);
        const getOrphanCount = overrides?.getOrphanCount ?? jest.fn().mockReturnValue(0);
        const modal = new CategoryEditorModal({} as any, initialCategories, onSave, getOrphanCount);
        modal.onOpen();
        return { modal, onSave, getOrphanCount };
    }

    it("CategoryEditorModal calls onSave with updated list after add", async () => {
        const { modal, onSave } = createModal();
        const nameInput = modal.contentEl.querySelector(
            'input[data-role="add-category-name"]'
        ) as HTMLInputElement;
        const addButton = modal.contentEl.querySelector(
            'button[data-role="add-category-submit"]'
        ) as HTMLButtonElement;

        nameInput.value = "memory";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
        addButton.click();

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith([
                ...initialCategories,
                { name: "memory", icon: expect.any(String) },
            ]);
        });
    });

    it("CategoryEditorModal calls onSave with updated list after delete", async () => {
        jest.spyOn(window, "confirm").mockReturnValue(true);
        const { modal, onSave } = createModal();

        (
            modal.contentEl.querySelector('button[data-role="delete-category"][data-name="quote"]') as HTMLButtonElement
        ).click();

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith([{ name: "insight", icon: "lightbulb" }]);
        });
    });

    it("CategoryEditorModal calls onSave with reordered list after move", async () => {
        const { modal, onSave } = createModal();

        (
            modal.contentEl.querySelector('button[data-role="move-category-down"][data-name="insight"]') as HTMLButtonElement
        ).click();

        await waitFor(() => {
            expect(onSave).toHaveBeenCalledWith([
                { name: "quote", icon: "quote" },
                { name: "insight", icon: "lightbulb" },
            ]);
        });
    });

    it("CategoryEditorModal calls getOrphanCount before delete confirm", () => {
        const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(false);
        const getOrphanCount = jest.fn().mockReturnValue(3);
        const { modal } = createModal({ getOrphanCount });

        (
            modal.contentEl.querySelector('button[data-role="delete-category"][data-name="quote"]') as HTMLButtonElement
        ).click();

        expect(getOrphanCount).toHaveBeenCalledWith("quote");
        expect(confirmSpy).toHaveBeenCalled();
        expect(getOrphanCount.mock.invocationCallOrder[0]).toBeLessThan(
            confirmSpy.mock.invocationCallOrder[0]
        );
    });

    it("CategoryEditorModal does not call onSave when delete is cancelled", async () => {
        jest.spyOn(window, "confirm").mockReturnValue(false);
        const { modal, onSave } = createModal();

        (
            modal.contentEl.querySelector('button[data-role="delete-category"][data-name="quote"]') as HTMLButtonElement
        ).click();

        await waitFor(() => {
            expect(onSave).not.toHaveBeenCalled();
        });
    });
});
