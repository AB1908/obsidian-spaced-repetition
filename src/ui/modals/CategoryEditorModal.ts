import type { App } from "obsidian";
import {
    addCategoryToList,
    CURATED_CATEGORY_ICONS,
    editCategoryInList,
    removeCategoryFromList,
    reorderCategoryInList,
    type CategoryConfig,
} from "src/config/annotation-categories";
import { Modal, setIcon } from "src/infrastructure/obsidian-facade";

type SaveCategories = (updated: CategoryConfig[]) => Promise<void>;
type GetOrphanCount = (categoryName: string) => number;

const ModalBase = ((Modal as unknown) || class {
    app: App;
    contentEl: HTMLDivElement;
    modalEl: HTMLDivElement;

    constructor(app: App) {
        this.app = app;
        this.contentEl = document.createElement("div");
        this.modalEl = document.createElement("div");
    }

    open() {
        (this as any).onOpen?.();
    }
}) as any;

export class CategoryEditorModal extends ModalBase {
    private readonly initialCategories: CategoryConfig[];
    private readonly onSaveCategories: SaveCategories;
    private readonly getOrphanCount: GetOrphanCount;

    constructor(
        app: App,
        categories: CategoryConfig[],
        onSave: SaveCategories,
        getOrphanCount: GetOrphanCount
    ) {
        super(app);
        this.initialCategories = [...categories];
        this.onSaveCategories = onSave;
        this.getOrphanCount = getOrphanCount;
    }

    onOpen(): void {
        let categories = [...this.initialCategories];
        let addFormOpen = false;
        let addNameDraft = "";
        let addIconDraft = CURATED_CATEGORY_ICONS[0];
        let editingName: string | null = null;
        let editDraftName = "";
        let editDraftIcon = CURATED_CATEGORY_ICONS[0];
        let errorMessage = "";

        const persistAndRender = async (nextCategories: CategoryConfig[]) => {
            categories = nextCategories;
            errorMessage = "";
            await this.onSaveCategories(nextCategories);
            render();
        };

        const setErrorAndRender = (message: string) => {
            errorMessage = message;
            render();
        };

        const renderIcon = (container: HTMLElement, icon: string) => {
            container.replaceChildren();
            const iconEl = document.createElement("div");
            container.appendChild(iconEl);
            setIcon(iconEl, icon);
        };

        const buildIconGrid = (
            selectedIcon: string,
            onSelect: (icon: CategoryConfig["icon"]) => void,
            dataRolePrefix: "add" | "edit"
        ) => {
            const grid = document.createElement("div");
            grid.className = "sr-category-icon-grid";
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(32px, 1fr))";
            grid.style.gap = "6px";
            grid.style.marginTop = "8px";

            CURATED_CATEGORY_ICONS.forEach((icon) => {
                const button = document.createElement("button");
                button.type = "button";
                button.dataset.role = `${dataRolePrefix}-icon-option`;
                button.dataset.icon = icon;
                button.className = selectedIcon === icon ? "is-active" : "";
                button.title = icon;
                button.setAttribute("aria-label", `Select icon ${icon}`);
                button.style.padding = "4px";
                button.style.borderRadius = "4px";
                button.style.border = "1px solid var(--background-modifier-border)";
                button.style.background =
                    selectedIcon === icon ? "var(--background-modifier-hover)" : "transparent";
                button.addEventListener("click", () => onSelect(icon));
                renderIcon(button, icon);
                grid.appendChild(button);
            });

            return grid;
        };

        const render = () => {
            this.contentEl.replaceChildren();

            const title = document.createElement("h2");
            title.textContent = "Manage Categories";
            this.contentEl.appendChild(title);

            if (errorMessage) {
                const error = document.createElement("div");
                error.dataset.role = "category-error";
                error.textContent = errorMessage;
                error.style.color = "var(--text-error)";
                error.style.marginBottom = "8px";
                this.contentEl.appendChild(error);
            }

            const list = document.createElement("div");
            list.className = "category-list";
            list.dataset.role = "category-list";
            list.style.display = "flex";
            list.style.flexDirection = "column";
            list.style.gap = "8px";

            categories.forEach((category) => {
                const row = document.createElement("div");
                row.className = "category-row";
                row.dataset.name = category.name;
                row.style.display = "flex";
                row.style.alignItems = "center";
                row.style.gap = "8px";

                const iconContainer = document.createElement("div");
                iconContainer.title = category.icon;
                iconContainer.setAttribute("aria-label", `${category.name} icon`);
                renderIcon(iconContainer, category.icon);
                row.appendChild(iconContainer);

                const nameEl = document.createElement("span");
                nameEl.textContent = category.name;
                nameEl.style.flex = "1";
                row.appendChild(nameEl);

                const upButton = document.createElement("button");
                upButton.type = "button";
                upButton.textContent = "↑";
                upButton.dataset.role = "move-category-up";
                upButton.dataset.name = category.name;
                upButton.title = `Move ${category.name} up`;
                upButton.setAttribute("aria-label", `Move ${category.name} up`);
                upButton.addEventListener("click", async () => {
                    const next = reorderCategoryInList(categories, category.name, "up");
                    if (next !== categories) {
                        await persistAndRender(next);
                    }
                });
                row.appendChild(upButton);

                const downButton = document.createElement("button");
                downButton.type = "button";
                downButton.textContent = "↓";
                downButton.dataset.role = "move-category-down";
                downButton.dataset.name = category.name;
                downButton.title = `Move ${category.name} down`;
                downButton.setAttribute("aria-label", `Move ${category.name} down`);
                downButton.addEventListener("click", async () => {
                    const next = reorderCategoryInList(categories, category.name, "down");
                    if (next !== categories) {
                        await persistAndRender(next);
                    }
                });
                row.appendChild(downButton);

                const editButton = document.createElement("button");
                editButton.type = "button";
                editButton.textContent = "Edit";
                editButton.dataset.role = "edit-category";
                editButton.dataset.name = category.name;
                editButton.title = `Edit ${category.name}`;
                editButton.setAttribute("aria-label", `Edit ${category.name}`);
                editButton.addEventListener("click", () => {
                    editingName = category.name;
                    editDraftName = category.name;
                    editDraftIcon = category.icon;
                    errorMessage = "";
                    render();
                });
                row.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.type = "button";
                deleteButton.textContent = "Delete";
                deleteButton.dataset.role = "delete-category";
                deleteButton.dataset.name = category.name;
                deleteButton.title = `Delete ${category.name}`;
                deleteButton.setAttribute("aria-label", `Delete ${category.name}`);
                deleteButton.addEventListener("click", async () => {
                    const orphanCount = this.getOrphanCount(category.name);
                    const orphanMessage =
                        orphanCount > 0
                            ? `${orphanCount} annotations reference this category and will become uncategorized.`
                            : "Annotations may reference this category.";
                    const confirmed = window.confirm(
                        `Delete category "${category.name}"?\n\n${orphanMessage}`
                    );
                    if (!confirmed) {
                        return;
                    }
                    await persistAndRender(removeCategoryFromList(categories, category.name));
                    if (editingName === category.name) {
                        editingName = null;
                    }
                });
                row.appendChild(deleteButton);

                list.appendChild(row);

                if (editingName === category.name) {
                    const editRow = document.createElement("div");
                    editRow.className = "edit-row";
                    editRow.dataset.role = "edit-row";
                    editRow.dataset.name = category.name;
                    editRow.style.padding = "8px";
                    editRow.style.border = "1px solid var(--background-modifier-border)";
                    editRow.style.borderRadius = "6px";

                    const editInput = document.createElement("input");
                    editInput.type = "text";
                    editInput.value = editDraftName;
                    editInput.dataset.role = "edit-category-name";
                    editInput.setAttribute("aria-label", "Edit category name");
                    editInput.addEventListener("input", (event) => {
                        editDraftName = (event.target as HTMLInputElement).value;
                    });
                    editRow.appendChild(editInput);

                    editRow.appendChild(
                        buildIconGrid(editDraftIcon, (icon) => {
                            editDraftIcon = icon;
                            render();
                        }, "edit")
                    );

                    const actions = document.createElement("div");
                    actions.style.display = "flex";
                    actions.style.gap = "8px";
                    actions.style.marginTop = "8px";

                    const saveEdit = document.createElement("button");
                    saveEdit.type = "button";
                    saveEdit.textContent = "Save";
                    saveEdit.dataset.role = "save-category-edit";
                    saveEdit.addEventListener("click", async () => {
                        const result = editCategoryInList(categories, category.name, {
                            name: editDraftName,
                            icon: editDraftIcon,
                        });
                        if ("error" in result) {
                            setErrorAndRender(result.error);
                            return;
                        }
                        editingName = null;
                        await persistAndRender(result);
                    });
                    actions.appendChild(saveEdit);

                    const cancelEdit = document.createElement("button");
                    cancelEdit.type = "button";
                    cancelEdit.textContent = "Cancel";
                    cancelEdit.dataset.role = "cancel-category-edit";
                    cancelEdit.addEventListener("click", () => {
                        editingName = null;
                        errorMessage = "";
                        render();
                    });
                    actions.appendChild(cancelEdit);

                    editRow.appendChild(actions);
                    list.appendChild(editRow);
                }
            });

            this.contentEl.appendChild(list);

            const addSection = document.createElement("div");
            addSection.className = "add-row";
            addSection.dataset.role = "add-row";
            addSection.style.marginTop = "12px";
            addSection.style.paddingTop = "12px";
            addSection.style.borderTop = "1px solid var(--background-modifier-border)";

            if (!addFormOpen) {
                const triggerButton = document.createElement("button");
                triggerButton.type = "button";
                triggerButton.textContent = "+ Add category";
                triggerButton.dataset.role = "add-category-trigger";
                triggerButton.addEventListener("click", () => {
                    addFormOpen = true;
                    render();
                });
                addSection.appendChild(triggerButton);
            } else {
                const addInput = document.createElement("input");
                addInput.type = "text";
                addInput.value = addNameDraft;
                addInput.placeholder = "Category name";
                addInput.dataset.role = "add-category-name";
                addInput.setAttribute("aria-label", "New category name");
                addInput.addEventListener("input", (event) => {
                    addNameDraft = (event.target as HTMLInputElement).value;
                });
                addSection.appendChild(addInput);

                addSection.appendChild(
                    buildIconGrid(addIconDraft, (icon) => {
                        addIconDraft = icon;
                        render();
                    }, "add")
                );

                const actions = document.createElement("div");
                actions.style.display = "flex";
                actions.style.gap = "8px";
                actions.style.marginTop = "8px";

                const addButton = document.createElement("button");
                addButton.type = "button";
                addButton.textContent = "Add";
                addButton.dataset.role = "add-category-submit";
                addButton.addEventListener("click", async () => {
                    const result = addCategoryToList(categories, {
                        name: addNameDraft,
                        icon: addIconDraft,
                    });
                    if ("error" in result) {
                        setErrorAndRender(result.error);
                        return;
                    }
                    addFormOpen = false;
                    addNameDraft = "";
                    addIconDraft = CURATED_CATEGORY_ICONS[0];
                    await persistAndRender(result);
                });
                actions.appendChild(addButton);

                const cancelAdd = document.createElement("button");
                cancelAdd.type = "button";
                cancelAdd.textContent = "Cancel";
                cancelAdd.dataset.role = "cancel-add-category";
                cancelAdd.addEventListener("click", () => {
                    addFormOpen = false;
                    addNameDraft = "";
                    addIconDraft = CURATED_CATEGORY_ICONS[0];
                    errorMessage = "";
                    render();
                });
                actions.appendChild(cancelAdd);

                addSection.appendChild(actions);
            }

            this.contentEl.appendChild(addSection);
        };

        render();
    }
}
