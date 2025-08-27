import React from 'react';
import type { FileUploaderProps } from '../interfaces/uploader.interfaces';
import { useUploader } from '../hooks/useUploader';
import { DragDropZone } from './DragDropZone';
import { useHealthCheck } from '../../shared/hooks/useHealthCheck';
import '../styles/uploader.css';

export const FileUploader: React.FC<FileUploaderProps> = ({
    onDocumentsUploaded,
    onClearDocuments,
    indexedFiles
}) => {
    const {
        selectedFiles,
        readyToProcess,
        uploading,
        error,
        success,
        handleFiles,
        processFiles,
        cancelSelection,
        clearAll
    } = useUploader();

    const { testConnection, testingConnection, connectionError, connectionSuccess } = useHealthCheck();

    const handleProcessFiles = () => {
        processFiles(onDocumentsUploaded);
    };

    const handleClear = () => {
        clearAll();
        onClearDocuments();
    };

    return (
        <div className="file-uploader">
            <div className="uploader-header">
                <h2>Subir Documentos</h2>
                <button
                    className="test-connection-button"
                    onClick={testConnection}
                    disabled={testingConnection}
                >
                    {testingConnection ? 'Probando...' : 'Probar conexión'}
                </button>
            </div>

            {indexedFiles.length === 0 && !readyToProcess ? (
                <div className="upload-area">
                    <DragDropZone onFilesSelected={handleFiles} />

                    {error && (
                        <div className="message error">
                            <strong>Error:</strong> {error}
                        </div>
                    )}

                    {success && (
                        <div className="message success">
                            <strong>Éxito:</strong> {success}
                        </div>
                    )}

                    {connectionError && (
                        <div className="message error">
                            <strong>Error:</strong> {connectionError}
                        </div>
                    )}

                    {connectionSuccess && (
                        <div className="message success">
                            <strong>Éxito:</strong> {connectionSuccess}
                        </div>
                    )}
                </div>
            ) : readyToProcess ? (
                <div className="files-ready">
                    <div className="message success">
                        <strong>Archivos seleccionados y validados:</strong>
                    </div>

                    <div className="selected-files-list">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </div>
                        ))}
                    </div>

                    <div className="process-actions">
                        <button
                            className="process-button"
                            onClick={handleProcessFiles}
                            disabled={uploading}
                        >
                            {uploading ? 'Procesando...' : 'Procesar y Guardar'}
                        </button>

                        <button
                            className="cancel-button"
                            onClick={cancelSelection}
                            disabled={uploading}
                        >
                            Cancelar
                        </button>
                    </div>

                    {uploading && (
                        <div className="upload-status">
                            <div className="spinner"></div>
                            <p>Procesando archivos y construyendo índice...</p>
                        </div>
                    )}

                    {error && (
                        <div className="message error">
                            <strong>Error:</strong> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="indexed-documents-summary">
                    <div className="message success">
                        <strong>Documentos indexados:</strong>
                    </div>

                    <div className="file-list">
                        {indexedFiles.map((filename, index) => (
                            <div key={index} className="file-item">
                                {filename}
                            </div>
                        ))}
                    </div>

                    <button
                        className="clear-button"
                        onClick={handleClear}
                        type="button"
                    >
                        Limpiar y subir nuevos documentos
                    </button>
                </div>
            )}
        </div>
    );
};