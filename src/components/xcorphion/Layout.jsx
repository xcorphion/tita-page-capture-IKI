import { useEffect } from 'react';
import FloatingNav from './FloatingNav';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);

const Layout = ({ children }) => {
    useEffect(() => {
        initDebug('Layout Orquestrador');
    }, []);

    return (
        <div className="relative w-full min-h-screen bg-black text-white font-inter selection:bg-accent-1 selection:text-white">
            <FloatingNav />
            <main className="w-full relative z-0">
                {children}
            </main>
        </div>
    );
};

export default Layout;
