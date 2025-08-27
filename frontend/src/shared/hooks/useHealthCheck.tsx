import { useState } from 'react';
import { checkHealth } from '../services/api';

export const useHealthCheck = () => {
    const [testingConnection, setTestingConnection] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);

    const testConnection = async () => {
        setTestingConnection(true);
        setConnectionError(null);
        setConnectionSuccess(null);

        try {
            await checkHealth();
            setConnectionSuccess('Conexión con el backend exitosa');
        } catch (err: any) {
            setConnectionError(`No se puede conectar con el backend: ${err.message}`);
        } finally {
            setTestingConnection(false);
        }
    };

    return {
        testingConnection,
        connectionError,
        connectionSuccess,
        testConnection
    };
};