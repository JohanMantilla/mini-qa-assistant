import { useState } from 'react';
import type { FileValidationResult, FileUploadResponse } from '../interfaces/uploader.interfaces';
import { uploadDocuments } from '../../shared/services/api';

export const useUploader = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [readyToProcess, setReadyToProcess] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [lastUploadTime, setLastUploadTime] = useState<number>(0);

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
        const minInterval = 10000;
        return timeSinceLastUpload >= minInterval;
    };

    const validateFiles = (files: FileList): FileValidationResult => {
        const invalidFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!validateMimeType(file)) {
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

        const oversizedFiles: string[] = [];
        const emptyFiles: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (!validateFileSize(file)) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                oversizedFiles.push(`${file.name} (${sizeMB}MB)`);
            }

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

        const filesArray = Array.from(files);
        setSelectedFiles(filesArray);
        setReadyToProcess(true);
        setSuccess(`${files.length} archivo(s) seleccionado(s) y validado(s). Listo para procesar.`);
    };

    const processFiles = async (onSuccess: (files: string[]) => void) => {
        if (!readyToProcess || selectedFiles.length === 0) {
            return;
        }

        if (!checkRateLimit()) {
            const remainingTime = Math.ceil((10000 - (Date.now() - lastUploadTime)) / 1000);
            setError(`Por favor espera ${remainingTime} segundos antes de procesar nuevos archivos`);
            return;
        }

        setUploading(true);
        setLastUploadTime(Date.now());

        try {
            const fileList = selectedFiles.reduce((acc, file, index) => {
                acc[index] = file;
                return acc;
            }, {} as any);
            fileList.length = selectedFiles.length;

            const response: FileUploadResponse = await uploadDocuments(fileList);
            setSuccess(response.message);
            onSuccess(response.files_list);

            setSelectedFiles([]);
            setReadyToProcess(false);
        } catch (err: any) {
            setError(err.message || 'Error al procesar los archivos');
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

    const clearAll = () => {
        setError(null);
        setSuccess(null);
        setSelectedFiles([]);
        setReadyToProcess(false);
    };

    return {
        selectedFiles,
        readyToProcess,
        uploading,
        error,
        success,
        handleFiles,
        processFiles,
        cancelSelection,
        clearAll
    };
};