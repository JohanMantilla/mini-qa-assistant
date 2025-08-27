import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import './App.css';

function App() {
  const [documentsIndexed, setDocumentsIndexed] = useState<boolean>(false);
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);

  const handleDocumentsUploaded = (files: string[]) => {
    setDocumentsIndexed(true);
    setIndexedFiles(files);
  };

  const handleClearDocuments = () => {
    setDocumentsIndexed(false);
    setIndexedFiles([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 Mini Asistente Q&A</h1>
        <p>Sube documentos, busca contenido y haz preguntas en lenguaje natural</p>
      </header>

      <main className="app-main">
        <div className="section">
          <FileUploader
            onDocumentsUploaded={handleDocumentsUploaded}
            onClearDocuments={handleClearDocuments}
            indexedFiles={indexedFiles}
          />
        </div>

        {documentsIndexed && (
          <>

          </>
        )}
      </main>
    </div>
  );
}

export default App;