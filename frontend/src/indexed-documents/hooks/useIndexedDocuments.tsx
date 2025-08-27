import { useState, useEffect } from 'react';
import type { IndexInfo } from '../interfaces/indexed-documents.interfaces';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const useIndexedDocuments = (refreshTrigger?: number) => {
    const [info, setInfo] = useState<IndexInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);

    const fetchIndexInfo = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/index/info`);
            const data = await response.json();
            setInfo(data);
        } catch (error) {
            console.error('Error fetching index info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIndexInfo();
    }, []);

    useEffect(() => {
        if (refreshTrigger !== undefined && refreshTrigger > 0) {
            fetchIndexInfo();
        }
    }, [refreshTrigger]);

    return {
        info,
        loading,
        expanded,
        setExpanded,
        fetchIndexInfo
    };
};