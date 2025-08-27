export interface SearchResult {
    text: string;
    document_name: string;
    relevance_score: number;
}

export interface SearchResponse {
    query: string;
    results: SearchResult[];
    total_results: number;
}