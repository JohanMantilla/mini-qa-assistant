export interface IndexInfo {
    documents_count: number;
    chunks_count: number;
    has_bm25_index: boolean;
    index_file_exists: boolean;
    document_names: string[];
}

export interface IndexedDocumentsProps {
    refreshTrigger?: number;
}