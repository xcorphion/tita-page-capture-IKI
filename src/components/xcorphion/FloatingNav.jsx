import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LucideHome, LucideLayers, LucideCpu, LucideNewspaper } from 'lucide-react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const FloatingNav = () => {
    useEffect(() => {
        initDebug('FloatingNav');
    }, []);

    const navItems = [
        { id: 'home', icon: <LucideHome size={20} />, label: 'Home' },
        { id: 'mission', icon: <LucideLayers size={20} />, label: 'Manifesto' },
        { id: 'deeptech', icon: <LucideCpu size={20} />, label: 'Deep Tech' },
        { id: 'news', icon: <LucideNewspaper size={20} />, label: 'News' }
    ];

    return (
        <motion.nav 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-1/2 -translate-y-1/2 left-6 z-50
                       flex flex-col items-center py-6 px-3 gap-6
                       bg-white/5 backdrop-blur-xl border border-white/10
                       rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        >
            <div className="w-10 h-10 mb-4 bg-accent-1 rounded-full flex items-center justify-center cursor-pointer" onClick={() => callDebug('Logo Clicked')}>
                <span className="font-space font-bold text-white text-lg">X</span>
            </div>

            <div className="flex flex-col gap-6">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => callDebug(`Navigating to ${item.id}`)}
                        className="text-text-dim hover:text-white transition-colors duration-300 relative group p-2 rounded-full hover:bg-white/10"
                        aria-label={item.label}
                    >
                        {item.icon}
                        <span className="absolute left-14 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-mono font-medium text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap border border-white/10">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </motion.nav>
    );
};

export default FloatingNav;
