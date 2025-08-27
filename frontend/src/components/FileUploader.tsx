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

    // Nuevo estado: archivos seleccionados pero no procesados
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [readyToProcess, setReadyToProcess] = useState(false);

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

    const validateFiles = (files: FileList): { valid: boolean; error?: string } => {
        // 1. Validar tipos de archivo (antes que cantidad)
        const invalidFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Validar tipo MIME primero
            if (!validateMimeType(file)) {
                // Si MIME type falla, validar por extensión como fallback
                const extension = '.' + file.name.split('.').pop()?.toLowerCase();
                if (!['.txt', '.pdf'].includes(extension)) {
                    invalidFiles.push(file.name);
                }
            }
        }

        if (invalidFiles.length > 0) {
            return {
                valid: false,
                error: `Formato no válido: ${invalidFiles.join(', ')}. Solo se permiten archivos .txt y .pdf`
            };
        }

        // 2. Validar número de archivos
        if (files.length < 3) {
            return {
                valid: false,
                error: 'Debe subir al menos 3 archivos'
            };
        }

        if (files.length > 10) {
            return {
                valid: false,
                error: 'No puede subir más de 10 archivos'
            };
        }

        // 3. Validaciones adicionales de archivos válidos
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
            return {
                valid: false,
                error: `Archivos muy grandes: ${oversizedFiles.join(', ')}. Máximo 10MB por archivo`
            };
        }

        if (emptyFiles.length > 0) {
            return {
                valid: false,
                error: `Archivos vacíos: ${emptyFiles.join(', ')}. Los archivos deben tener contenido`
            };
        }

        return { valid: true };
    };

    const handleFiles = (files: FileList) => {
        setError(null);
        setSuccess(null);

        const validation = validateFiles(files);
        if (!validation.valid) {
            setError(validation.error!);
            return;
        }

        // Convertir FileList a Array y guardar
        const filesArray = Array.from(files);
        setSelectedFiles(filesArray);
        setReadyToProcess(true);
        setSuccess(`✅ ${files.length} archivo(s) seleccionado(s) y validado(s). Listo para procesar.`);
    };

    const processFiles = async () => {
        if (!readyToProcess || selectedFiles.length === 0) {
            return;
        }

        // Rate limiting - verificar tiempo entre uploads
        if (!checkRateLimit()) {
            const remainingTime = Math.ceil((10000 - (Date.now() - lastUploadTime)) / 1000);
            setError(`Por favor espera ${remainingTime} segundos antes de procesar nuevos archivos`);
            return;
        }

        setUploading(true);
        setLastUploadTime(Date.now());

        try {
            // Convertir array de archivos a FileList-like para la API
            const fileList = selectedFiles.reduce((acc, file, index) => {
                acc[index] = file;
                return acc;
            }, {} as any);
            fileList.length = selectedFiles.length;

            const response: UploadResponse = await uploadDocuments(fileList);
            setSuccess(response.message);
            onDocumentsUploaded(response.files_list);

            // Limpiar estado después del éxito
            setSelectedFiles([]);
            setReadyToProcess(false);
        } catch (err: any) {
            console.error('Error uploading files:', err);
            setError(err.message || 'Error al procesar los archivos');
            // Si falla, resetear el tiempo para permitir reintento inmediato
            setLastUploadTime(0);
        } finally {
            setUploading(false);
        }
    };

    const cancelSelection = () => {
        setSelectedFiles([]);
        setReadyToProcess(false);
        setError(null);
        setSuccess(null);
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
        setSelectedFiles([]);
        setReadyToProcess(false);
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

            {indexedFiles.length === 0 && !readyToProcess ? (
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

                        <>
                            <div className="upload-icon">📤</div>
                            <h3>Arrastra archivos aquí o haz clic para seleccionar</h3>
                            <p>Selecciona entre 3 y 10 archivos (.txt o .pdf)</p>
                        </>
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
            ) : readyToProcess ? (
                <div className="files-ready">
                    <div className="message success">
                        <strong>📋 Archivos seleccionados y validados:</strong>
                    </div>

                    <div className="selected-files-list">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="file-item">
                                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            </div>
                        ))}
                    </div>

                    <div className="process-actions">
                        <button
                            className="process-button"
                            onClick={processFiles}
                            disabled={uploading}
                        >
                            {uploading ? '⏳ Procesando...' : '🚀 Procesar y Guardar'}
                        </button>

                        <button
                            className="cancel-button"
                            onClick={cancelSelection}
                            disabled={uploading}
                        >
                            ❌ Cancelar
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
                            <strong>❌ Error:</strong> {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="indexed-documents-summary">
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