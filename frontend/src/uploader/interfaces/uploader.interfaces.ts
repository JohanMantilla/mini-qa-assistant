export interface FileUploadResponse {
    message: string;
    files_processed: number;
    files_list: string[];
}

export interface FileUploaderProps {
    onDocumentsUploaded: (files: string[]) => void;
    onClearDocuments: () => void;
    indexedFiles: string[];
}

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}