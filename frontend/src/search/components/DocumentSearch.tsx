import React from 'react';
import { useSearch } from '../hooks/useSearch';
import '../styles/search.css';

export const DocumentSearch: React.FC = () => {
    const {
        query,
        setQuery,
        results,
        searching,
        error,
        hasSearched,
        performSearch,
        clearSearch
    } = useSearch();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(query);
    };

    return (
        <div className="document-search">
            <h2>Buscar en Documentos</h2>

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

                    {(hasSearched || results) && (
                        <button
                            type="button"
                            className="clear-search-button"
                            onClick={clearSearch}
                        >
                            ✖️
                        </button>
                    )}
                </div>
            </form>

            {error && (
                <div className="message error">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {searching && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Buscando...</p>
                </div>
            )}

            {hasSearched && !searching && results && (
                <div className="search-results">
                    {results.results.length > 0 ? (
                        <>
                            <div className="results-header">
                                <h3>Resultados encontrados ({results.results.length})</h3>
                            </div>

                            <div className="results-list">
                                {results.results.map((result, index) => (
                                    <div key={index} className="result-item">
                                        <div className="result-header">
                                            <span className="document-name">{result.document_name}</span>
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
                            <p>No se encontraron resultados para "<strong>{results.query}</strong>"</p>
                            <p>Intenta con otras palabras clave o términos más generales.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};