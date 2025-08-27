export interface Citation {
    text: string;
    document_name: string;
}

export interface AskResponse {
    question: string;
    answer: string;
    citations: Citation[];
}