import { useState } from 'react';
import type { AskResponse } from '../interfaces/qa.interfaces';
import { askQuestion } from '../../shared/services/api';

export const useQuestionAnswer = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState<AskResponse | null>(null);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);

    const submitQuestion = async (questionText: string) => {
        if (!questionText.trim()) {
            setError('Ingresa una pregunta');
            return;
        }

        setAsking(true);
        setError(null);
        setResponse(null);

        try {
            const result = await askQuestion(questionText);
            setResponse(result);
        } catch (err: any) {
            setError(err.message || 'Error al procesar la pregunta');
        } finally {
            setAsking(false);
        }
    };

    const handleCitationClick = (index: number) => {
        setHighlightedCitation(highlightedCitation === index ? null : index);
    };

    const clearQuestion = () => {
        setQuestion('');
        setResponse(null);
        setError(null);
        setHighlightedCitation(null);
    };

    return {
        question,
        setQuestion,
        response,
        asking,
        error,
        highlightedCitation,
        submitQuestion,
        handleCitationClick,
        clearQuestion
    };
};