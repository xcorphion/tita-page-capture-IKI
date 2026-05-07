import { useEffect } from 'react';
import FloatingNav from './FloatingNav';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const Layout = ({ children }) => {
    useEffect(() => {
        initDebug('Layout Orquestrador');
    }, []);

    return (
        <div style={{ position: 'relative', width: '100%', minHeight: '100vh', backgroundColor: '#000', color: '#fff', margin: 0, padding: 0 }}>
            <FloatingNav />
            <main style={{ width: '100%', margin: 0, padding: 0 }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
