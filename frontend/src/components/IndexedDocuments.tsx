import React, { useState, useEffect } from 'react';

interface IndexInfo {
  documents_count: number;
  chunks_count: number;
  has_bm25_index: boolean;
  index_file_exists: boolean;
  document_names: string[];
}

interface IndexedDocumentsProps {
  refreshTrigger?: number;
}

const IndexedDocuments: React.FC<IndexedDocumentsProps> = ({ refreshTrigger }) => {
  const [info, setInfo] = useState<IndexInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const fetchIndexInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/index/info`);
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

  // Actualizar cuando el trigger cambie
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchIndexInfo();
    }
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="indexed-documents">
        <h2>📚 Documentos Indexados</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!info || info.documents_count === 0) {
    return (
      <div className="indexed-documents">
        <h2>📚 Documentos Indexados</h2>
        <div className="empty-state">
          <p>📭 No hay documentos indexados</p>
          <p>Sube al menos 3 documentos para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="indexed-documents">
      <div className="section-header">
        <h2>📚 Documentos Indexados</h2>
        <button
          className="toggle-button"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? '🔼 Contraer' : '🔽 Expandir'}
        </button>
      </div>

      <div className="status-summary">
        <div className="status-card">
          <span className="status-icon">📄</span>
          <div className="status-info">
            <span className="status-number">{info.documents_count}</span>
            <span className="status-label">Documentos</span>
          </div>
        </div>

        <div className="status-card">
          <span className="status-icon">🧩</span>
          <div className="status-info">
            <span className="status-number">{info.chunks_count}</span>
            <span className="status-label">Fragmentos</span>
          </div>
        </div>

        <div className="status-card">
          <span className="status-icon">💾</span>
          <div className="status-info">
            <span className={`status-badge ${info.index_file_exists ? 'success' : 'error'}`}>
              {info.index_file_exists ? 'Guardado' : 'No guardado'}
            </span>
            <span className="status-label">Estado</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="documents-list">
          <div className="list-header">
            <h3>📋 Lista de Documentos</h3>
            <button onClick={fetchIndexInfo} className="refresh-mini-button">
              🔄
            </button>
          </div>

          <div className="documents-grid">
            {info.document_names.map((name, index) => {
              const extension = name.split('.').pop()?.toLowerCase();
              const icon = extension === 'pdf' ? '📕' : '📄';

              return (
                <div key={index} className="document-card">
                  <span className="document-icon">{icon}</span>
                  <div className="document-info">
                    <span className="document-name">{name}</span>
                    <span className="document-type">{extension?.toUpperCase()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndexedDocuments;