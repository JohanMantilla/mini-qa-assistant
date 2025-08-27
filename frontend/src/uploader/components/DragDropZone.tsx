import React, { useCallback, useState } from 'react';

interface DragDropZoneProps {
    onFilesSelected: (files: FileList) => void;
    disabled?: boolean;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({ onFilesSelected, disabled = false }) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, [disabled]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFilesSelected(e.dataTransfer.files);
        }
    }, [onFilesSelected, disabled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
        }
    };

    return (
        <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
            <input
                id="file-input"
                type="file"
                multiple
                accept=".txt,.pdf"
                onChange={handleInputChange}
                style={{ display: 'none' }}
                disabled={disabled}
            />

            <div className="upload-icon">📤</div>
            <h3>Arrastra archivos aquí o haz clic para seleccionar</h3>
            <p>Selecciona entre 3 y 10 archivos (.txt o .pdf)</p>
        </div>
    );
};