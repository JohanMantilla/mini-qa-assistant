import { useState } from 'react';
import type { SearchResponse } from '../interfaces/search.interfaces';
import { searchDocuments } from '../../shared/services/api';

export const useSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResponse | null>(null);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setError('Ingresa una consulta de búsqueda');
            return;
        }

        setSearching(true);
        setError(null);
        setHasSearched(true);

        try {
            const response = await searchDocuments(searchQuery);
            setResults(response);
        } catch (err: any) {
            setError(err.message || 'Error al realizar la búsqueda');
            setResults(null);
        } finally {
            setSearching(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults(null);
        setError(null);
        setHasSearched(false);
    };

    return {
        query,
        setQuery,
        results,
        searching,
        error,
        hasSearched,
        performSearch,
        clearSearch
    };
};