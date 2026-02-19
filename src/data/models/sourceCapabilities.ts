import type { SourceType } from "src/data/source-discovery";

export type AnnotationMainFilter = "unprocessed" | "processed" | "all";
export type AnnotationListFlow = "import" | "card-creation";
export type CardCreationMode = "processed-category" | "all-no-processing";

export interface SourceCapabilities {
    sourceType: SourceType;
    cardCreationMode: CardCreationMode;
    showCategoryFilter: boolean;
    showColorFilter: boolean;
    supportsProcessingFlow: boolean;
    requiresMutationConfirmation: boolean;
}

export interface AnnotationListViewPolicy {
    defaultMainFilter: AnnotationMainFilter;
    enforcedMainFilter: AnnotationMainFilter | null;
    showMainFilterButtons: boolean;
    showCategoryFilter: boolean;
    showColorFilter: boolean;
}

export function getSourceCapabilities(sourceType: SourceType, requiresMutationConfirmation: boolean): SourceCapabilities {
    if (sourceType === "direct-markdown") {
        return {
            sourceType,
            cardCreationMode: "all-no-processing",
            showCategoryFilter: false,
            showColorFilter: false,
            supportsProcessingFlow: false,
            requiresMutationConfirmation,
        };
    }

    return {
        sourceType: "moonreader",
        cardCreationMode: "processed-category",
        showCategoryFilter: true,
        showColorFilter: true,
        supportsProcessingFlow: true,
        requiresMutationConfirmation,
    };
}

export function getAnnotationListViewPolicy(
    sourceCapabilities: SourceCapabilities,
    flow: AnnotationListFlow
): AnnotationListViewPolicy {
    if (flow === "import") {
        return {
            defaultMainFilter: "unprocessed",
            enforcedMainFilter: null,
            showMainFilterButtons: true,
            showCategoryFilter: sourceCapabilities.showCategoryFilter,
            showColorFilter: sourceCapabilities.showColorFilter,
        };
    }

    if (sourceCapabilities.cardCreationMode === "processed-category") {
        return {
            defaultMainFilter: "processed",
            enforcedMainFilter: "processed",
            showMainFilterButtons: false,
            showCategoryFilter: true,
            showColorFilter: false,
        };
    }

    return {
        defaultMainFilter: "all",
        enforcedMainFilter: "all",
        showMainFilterButtons: false,
        showCategoryFilter: false,
        showColorFilter: false,
    };
}
