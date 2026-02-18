export interface Tree {
    id: number;
    asset_id: string;
    division: string;
    block: string;
    tree_number: string;
    created_at: string;
    updated_at: string;
}

export interface BlockMissingTrees {
    block: string;
    division: string;
    total: number;
    trees: { tree_number: string; asset_id: string }[];
}

export interface UploadResult {
    success: boolean;
    message: string;
    data?: {
        total_missing: number;
        by_block: Record<string, number>;
        duplicate_coordinates: number;
    };
}

export interface DuplicateCoordinateGroup {
    latitude: string;
    longitude: string;
    count: number;
    is_cross_block: boolean;
    trees: {
        asset_id: string;
        block: string;
        block_id: string;
        division: string;
        tree_number: string;
    }[];
}
