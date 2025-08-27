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
    const [testingConnection, setTestingConnection] = useState(false);
    const [lastUploadTime, setLastUploadTime] = useState<number>(0);

    const testBackendConnection = async () => {
        setTestingConnection(true);
        setError(null);

        try {
            await checkHealth();
            setSuccess('✅ Conexión con el backend exitosa');
        } catch (err: any) {
            setError(`❌ No se puede conectar con el backend: ${err.message}`);
        } finally {
            setTestingConnection(false);
        }
    };

    const validateFileSize = (file: File): boolean => {
        const maxSizeMB = 10;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    };

    const validateMimeType = (file: File): boolean => {
        const allowedMimeTypes = [
            'text/plain',
            'application/pdf'
        ];
        return allowedMimeTypes.includes(file.type);
    };

    const checkRateLimit = (): boolean => {
        const now = Date.now();
        const timeSinceLastUpload = now - lastUploadTime;
        const minInterval = 10000; // 10 segundos entre uploads

        return timeSinceLastUpload >= minInterval;
    };

    const handleFiles = async (files: FileList) => {
        setError(null);
        setSuccess(null);

        // 1. PRIMERO: Validar tipos de archivo (antes que cantidad)
        const invalidFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validar tipo MIME primero
            if (!validateMimeType(file)) {
                // Si MIME type falla, validar por extensión como fallback
                const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!['.txt', '.pdf'].includes(extension)) {
                    invalidFiles.push(file.name); // Solo el nombre, sin tipo MIME
                }
            }
        }

        if (invalidFiles.length > 0) {
            setError(`Formato no válido: ${invalidFiles.join(', ')}. Solo se permiten archivos .txt y .pdf`);
            return;
        }

        // 2. Rate limiting - verificar tiempo entre uploads
        if (!checkRateLimit()) {
            const remainingTime = Math.ceil((10000 - (Date.now() - lastUploadTime)) / 1000);
            setError(`Por favor espera ${remainingTime} segundos antes de subir nuevos archivos`);
            return;
        }

        // 3. Validar número de archivos
        if (files.length < 3) {
            setError('Debe subir al menos 3 archivos');
            return;
        }

        if (files.length > 10) {
            setError('No puede subir más de 10 archivos');
            return;
        }

        // 4. Validaciones adicionales de archivos válidos
        const oversizedFiles: string[] = [];
        const emptyFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validar tamaño de archivo (máx. 10MB)
            if (!validateFileSize(file)) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                oversizedFiles.push(`${file.name} (${sizeMB}MB)`);
            }

            // Validar que el archivo no esté vacío
            if (file.size === 0) {
                emptyFiles.push(file.name);
            }
        }

        if (oversizedFiles.length > 0) {
            setError(`Archivos muy grandes: ${oversizedFiles.join(', ')}. Máximo 10MB por archivo`);
            return;
        }

        if (emptyFiles.length > 0) {
            setError(`Archivos vacíos: ${emptyFiles.join(', ')}. Los archivos deben tener contenido`);
            return;
        }

        setUploading(true);
        setLastUploadTime(Date.now()); // Actualizar tiempo del último upload

        try {
            const response: UploadResponse = await uploadDocuments(files);
            setSuccess(response.message);
            onDocumentsUploaded(response.files_list);
        } catch (err: any) {
            console.error('Error uploading files:', err);
            setError(err.message || 'Error al procesar los archivos');
            // Si falla, resetear el tiempo para permitir reintento inmediato
            setLastUploadTime(0);
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
            <div className="uploader-header">
                <h2>📁 Subir Documentos</h2>
                <button
                    className="test-connection-button"
                    onClick={testBackendConnection}
                    disabled={testingConnection}
                >
                    {testingConnection ? '⏳ Probando...' : '🔗 Probar conexión'}
                </button>
            </div>

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