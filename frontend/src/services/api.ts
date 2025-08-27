const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Tipos para las respuestas de la API
export interface FileUploadResponse {
    message: string;
    files_processed: number;
    files_list: string[];
}

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

export interface Citation {
    text: string;
    document_name: string;
}

export interface AskResponse {
    question: string;
    answer: string;
    citations: Citation[];
}

export interface ErrorResponse {
    error: string;
    detail?: string;
}

// Función para manejar errores de la API
const handleApiError = async (response: Response): Promise<never> => {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;

    try {
        const errorData: ErrorResponse = await response.json();
        if (errorData.detail) {
            errorMessage = errorData.detail;
        } else if (errorData.error) {
            errorMessage = errorData.error;
        }
    } catch {
        // Si no se puede parsear el JSON, usar el mensaje de estado HTTP
    }

    throw new Error(errorMessage);
};

// Subir documentos para indexar
export const uploadDocuments = async (files: FileList): Promise<FileUploadResponse> => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/ingest`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error de conexión con el servidor');
    }
};

// Buscar en documentos
export const searchDocuments = async (query: string): Promise<SearchResponse> => {
    try {
        const encodedQuery = encodeURIComponent(query);
        const response = await fetch(`${API_BASE_URL}/search?q=${encodedQuery}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        console.error('Search error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error de conexión con el servidor');
    }
};

// Hacer pregunta en lenguaje natural
export const askQuestion = async (question: string): Promise<AskResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            await handleApiError(response);
        }

        return await response.json();
    } catch (error) {
        console.error('Ask error:', error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Error de conexión con el servidor');
    }
};

// Verificar estado del backend
export const checkHealth = async (): Promise<{ status: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Health check error:', error);
        throw new Error('El backend no está disponible');
    }
};