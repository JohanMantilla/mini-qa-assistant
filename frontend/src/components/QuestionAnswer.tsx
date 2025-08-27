import React, { useState } from 'react';
import { askQuestion } from '../services/api';

interface Citation {
    text: string;
    document_name: string;
}

interface AskResponse {
    question: string;
    answer: string;
    citations: Citation[];
}

const QuestionAnswer: React.FC = () => {
    const [question, setQuestion] = useState('');
    const [response, setResponse] = useState<AskResponse | null>(null);
    const [asking, setAsking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) {
            setError('Ingresa una pregunta');
            return;
        }

        setAsking(true);
        setError(null);
        setResponse(null);

        try {
            const result: AskResponse = await askQuestion(question);
            setResponse(result);
        } catch (err: any) {
            console.error('Error asking question:', err);
            setError(err.message || 'Error al procesar la pregunta');
        } finally {
            setAsking(false);
        }
    };

    const handleClear = () => {
        setQuestion('');
        setResponse(null);
        setError(null);
    };

    return (
        <div className="question-answer">
            <h2>❓ Preguntas y Respuestas</h2>

            <form onSubmit={handleAsk} className="question-form">
                <div className="question-input-group">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Haz una pregunta sobre el contenido de los documentos..."
                        className="question-textarea"
                        disabled={asking}
                        rows={3}
                        maxLength={500}
                    />
                    <div className="question-actions">
                        <button
                            type="submit"
                            className="ask-button"
                            disabled={asking || !question.trim()}
                        >
                            {asking ? '🤔 Pensando...' : '💭 Preguntar'}
                        </button>

                        {(response || error) && (
                            <button
                                type="button"
                                className="clear-question-button"
                                onClick={handleClear}
                            >
                                🗑️ Limpiar
                            </button>
                        )}
                    </div>
                </div>

                <div className="char-counter">
                    {question.length}/500 caracteres
                </div>
            </form>

            {error && (
                <div className="message error">
                    <strong>❌ Error:</strong> {error}
                </div>
            )}

            {asking && (
                <div className="loading">
                    <div className="spinner"></div>
                    <p>Analizando documentos y generando respuesta...</p>
                </div>
            )}

            {response && !asking && (
                <div className="qa-response">
                    <div className="question-display">
                        <h3>❓ Pregunta:</h3>
                        <p>"{response.question}"</p>
                    </div>

                    <div className="answer-display">
                        <h3>💡 Respuesta:</h3>
                        <div className="answer-text">
                            {response.answer}
                        </div>
                    </div>

                    {response.citations && response.citations.length > 0 && (
                        <div className="citations-display">
                            <h3>📚 Fuentes:</h3>
                            <div className="citations-list">
                                {response.citations.map((citation, index) => (
                                    <div key={index} className="citation-item">
                                        <div className="citation-header">
                                            <span className="citation-number">#{index + 1}</span>
                                            <span className="citation-document">📄 {citation.document_name}</span>
                                        </div>
                                        <div className="citation-text">
                                            "{citation.text}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionAnswer;