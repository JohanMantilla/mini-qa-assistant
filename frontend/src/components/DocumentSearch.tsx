import React, { useState } from 'react';
import { searchDocuments } from '../services/api';

interface SearchResult {
    text: string;
    document_name: string;
    relevance_score: number;
}

interface SearchResponse {
    query: string;
    results: SearchResult[];
    total_results: number;
}

const DocumentSearch: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            setError('Ingresa una consulta de búsqueda');
            return;
        }

        setSearching(true);
        setError(null);
        setHasSearched(true);

        try {
            const response: SearchResponse = await searchDocuments(query);
            setResults(response.results);
        } catch (err: any) {
            console.error('Error searching:', err);
            setError(err.message || 'Error al realizar la búsqueda');
            setResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setError(null);
        setHasSearched(false);
    };

    return (
        <div className="document-search">
            <h2>🔍 Buscar en Documentos</h2>

            <form onSubmit={handleSearch} className="search-form">
                <div className="search-input-group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Busca palabras clave en los documentos..."
                        className="search-input"
                        disabled={searching}
                        maxLength={200}
                    />
                    <button
                        type="submit"
                        className="search-button"
                        disabled={searching || !query.trim()}
                    >
                        {searching ? '⏳' : '🔍'}
                    </button>

                    {(hasSearched || results.length > 0) && (
                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={handleClear}
                        >
                            ✖️
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <div className="message error">
                    <strong>❌ Error:</strong> {error}
                </div>
            )}

            {searching && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Buscando...</p>
                </div>
            )}

            {hasSearched && !searching && (
                <div className="search-results">
                    {results.length > 0 ? (
                        <>
                            <div className="results-header">
                                <h3>Resultados encontrados ({results.length})</h3>
                            </div>

                            <div className="results-list">
                                {results.map((result, index) => (
                                    <div key={index} className="result-item">
                                        <div className="result-header">
                                            <span className="document-name">📄 {result.document_name}</span>
                                            <span className="relevance-score">
                                                {Math.round(result.relevance_score * 100)}% relevancia
                                            </span>
                                        </div>
                                        <div className="result-text">
                                            {result.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-results">
                            <p>📭 No se encontraron resultados para "<strong>{query}</strong>"</p>
                            <p>Intenta con otras palabras clave o términos más generales.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentSearch;