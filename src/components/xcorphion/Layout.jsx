import { useEffect } from 'react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const Layout = ({ children }) => {
    useEffect(() => {
        initDebug('Layout Orquestrador');
    }, []);

    return (
        <div style={{ margin: 0, padding: 0, background: '#000' }}>
            <main>{children}</main>
        </div>
    );
};

export default Layout;
