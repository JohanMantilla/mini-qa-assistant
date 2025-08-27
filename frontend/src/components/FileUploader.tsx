import React, { useState, useCallback } from 'react';
import { uploadDocuments, checkHealth } from '../services/api';

interface FileUploaderProps {
    onDocumentsUploaded: (files: string[]) => void;
    onClearDocuments: () => void;
    indexedFiles: string[];
}

interface UploadResponse {
    message: string;
    files_processed: number;
    files_list: string[];
}

const FileUploader: React.FC<FileUploaderProps> = ({
    onDocumentsUploaded,
    onClearDocuments,
    indexedFiles
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleFiles = async (files: FileList) => {
        setError(null);
        setSuccess(null);

        const allowedTypes = ['.txt', '.pdf'];
        const invalidFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!allowedTypes.includes(extension)) {
                invalidFiles.push(file.name);
            }
        }

        if (invalidFiles.length > 0) {
            setError(`Archivos con formato no válido: ${invalidFiles.join(', ')}. Solo se permiten .txt y .pdf`);
            return;
        }


        if (files.length < 3) {
            setError('Debe subir al menos 3 archivos');
            return;
        }

        if (files.length > 10) {
            setError('No puede subir más de 10 archivos');
            return;
        }

        setUploading(true);

        try {
            const response: UploadResponse = await uploadDocuments(files);
            setSuccess(response.message);
            onDocumentsUploaded(response.files_list);
        } catch (err: any) {
            console.error('Error uploading files:', err);
            setError(err.message || 'Error al procesar los archivos');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const handleClear = () => {
        setError(null);
        setSuccess(null);
        onClearDocuments();
    };

    return (
        <div className="file-uploader">
            <h2>📁 Subir Documentos</h2>

            {indexedFiles.length === 0 ? (
                <div className="upload-area">
                    <div
                        className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            multiple
                            accept=".txt,.pdf"
                            onChange={handleInputChange}
                            style={{ display: 'none' }}
                        />

                        {uploading ? (
                            <div className="upload-status">
                                <div className="spinner"></div>
                                <p>Procesando archivos...</p>
                            </div>
                        ) : (
                            <>
                                <div className="upload-icon">📤</div>
                                <h3>Arrastra archivos aquí o haz clic para seleccionar</h3>
                                <p>Sube entre 3 y 10 archivos (.txt o .pdf)</p>
                            </>
                        )}
                    </div>

                    {error && (
                        <div className="message error">
                            <strong>❌ Error:</strong> {error}
                        </div>
                    )}

                    {success && (
                        <div className="message success">
                            <strong>✅ Éxito:</strong> {success}
                        </div>
                    )}
                </div>
            ) : (
                <div className="indexed-documents">
                    <div className="message success">
                        <strong>✅ Documentos indexados:</strong>
                    </div>

                    <div className="file-list">
                        {indexedFiles.map((filename, index) => (
                            <div key={index} className="file-item">
                                📄 {filename}
                            </div>
                        ))}
                    </div>

                    <button
                        className="clear-button"
                        onClick={handleClear}
                        type="button"
                    >
                        🗑️ Limpiar y subir nuevos documentos
                    </button>
                </div>
            )}
        </div>
    );
};


export default FileUploader;