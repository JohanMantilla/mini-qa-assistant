import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import DocumentSearch from './components/DocumentSearch';
import QuestionAnswer from './components/QuestionAnswer';
import IndexedDocuments from './components/IndexedDocuments';
import './App.css';

function App() {
  const [documentsIndexed, setDocumentsIndexed] = useState<boolean>(false);
  const [indexedFiles, setIndexedFiles] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleDocumentsUploaded = (files: string[]) => {
    setDocumentsIndexed(true);
    setIndexedFiles(files);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleClearDocuments = () => {
    setDocumentsIndexed(false);
    setIndexedFiles([]);
    setRefreshTrigger(prev => prev + 1);
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

        <IndexedDocuments key={refreshTrigger} refreshTrigger={refreshTrigger} />

        {documentsIndexed && (
          <>
            <div className="section">
              <DocumentSearch />
            </div>

            <div className="section">
              <QuestionAnswer />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;