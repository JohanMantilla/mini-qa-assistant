import React from 'react';
import { useQuestionAnswer } from '../hooks/useQuestionAnswer';
import '../styles/qa.css';

export const QuestionAnswer: React.FC = () => {
    const {
        question,
        setQuestion,
        response,
        asking,
        error,
        highlightedCitation,
        submitQuestion,
        handleCitationClick,
        clearQuestion
    } = useQuestionAnswer();

    const handleAsk = (e: React.FormEvent) => {
        e.preventDefault();
        submitQuestion(question);
    };

    return (
        <div className="question-answer">
            <h2>Preguntas y Respuestas</h2>

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
                            {asking ? 'Pensando...' : 'Preguntar'}
                        </button>

                        {(response || error) && (
                            <button
                                type="button"
                                className="clear-question-button"
                                onClick={clearQuestion}
                            >
                                Limpiar
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
                    <strong>Error:</strong> {error}
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
                        <h3>Pregunta:</h3>
                        <p>"{response.question}"</p>
                    </div>

                    <div className="answer-display">
                        <h3>Respuesta:</h3>
                        <div className="answer-text">
                            {response.answer}
                        </div>
                    </div>

                    {response.citations && response.citations.length > 0 && (
                        <div className="citations-display">
                            <h3>Fuentes:</h3>
                            <p className="citations-hint">Haz clic en una cita para resaltarla</p>
                            <div className="citations-list">
                                {response.citations.map((citation, index) => (
                                    <div
                                        key={index}
                                        className={`citation-item ${highlightedCitation === index ? 'highlighted' : ''}`}
                                        onClick={() => handleCitationClick(index)}
                                    >
                                        <div className="citation-header">
                                            <span className="citation-number">#{index + 1}</span>
                                            <span className="citation-document">{citation.document_name}</span>
                                            <span className="citation-click-hint">Clic para resaltar</span>
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