import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LucideHome, 
  LucideLayers, 
  LucideCpu, 
  LucideNewspaper, 
  LucideSettings, 
  LucideChevronRight,
  LucideZap
} from 'lucide-react';

const initDebug = (moduleName) => console.log(`[DEBUG][INIT] Módulo montado: ${moduleName}`);
const callDebug = (action) => console.log(`[DEBUG][CALL] Ação disparada: ${action}`);

const SidebarPrototype = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeItem, setActiveItem] = useState('home');

    useEffect(() => {
        initDebug('SidebarPrototype (Sandbox)');
    }, []);

    const navItems = [
        { id: 'home', icon: <LucideHome size={22} />, label: 'Xcorphion Home', detail: 'Início da jornada' },
        { id: 'mission', icon: <LucideLayers size={22} />, label: 'Manifesto', detail: 'Nossa visão de IA' },
        { id: 'deeptech', icon: <LucideCpu size={22} />, label: 'Deep Tech', detail: 'Algoritmos Somáticos' },
        { id: 'news', icon: <LucideNewspaper size={22} />, label: 'News Feed', detail: 'Atualizações' },
    ];

    return (
        <motion.nav 
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            className="fixed top-6 bottom-6 left-6 z-[100] flex flex-col pointer-events-auto"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <motion.div 
                animate={{ 
                    width: isExpanded ? 240 : 64,
                    backgroundColor: isExpanded ? 'rgba(15, 5, 5, 0.9)' : 'rgba(255, 255, 255, 0.05)'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="h-full flex flex-col items-stretch overflow-hidden
                           backdrop-blur-2xl border border-white/10
                           rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                           relative"
            >
                {/* Logo Area */}
                <div className="p-4 flex items-center justify-center">
                    <div className="w-10 h-10 min-w-[40px] bg-accent-1 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(139,0,0,0.4)]">
                        <LucideZap size={20} className="text-white" />
                    </div>
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.span 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="ml-4 font-space font-bold text-lg text-white tracking-tight"
                            >
                                XCORPHION
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 px-3 mt-8 flex flex-col gap-2">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveItem(item.id);
                                callDebug(`Sidebar Selected: ${item.id}`);
                            }}
                            className={`flex items-center p-3 rounded-2xl transition-all duration-300 relative group
                                       ${activeItem === item.id ? 'bg-white/10 text-white' : 'text-text-dim hover:text-white hover:bg-white/5'}`}
                        >
                            <div className="min-w-[24px] flex items-center justify-center">
                                {item.icon}
                            </div>
                            
                            {isExpanded && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-4 flex flex-col items-start"
                                >
                                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                                    <span className="text-[10px] text-text-dim opacity-60 whitespace-nowrap">{item.detail}</span>
                                </motion.div>
                            )}

                            {activeItem === item.id && (
                                <motion.div 
                                    layoutId="activeIndicator"
                                    className="absolute left-0 w-1 h-6 bg-accent-1 rounded-r-full"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Footer / Settings */}
                <div className="p-3 border-t border-white/5">
                    <button className="flex items-center p-3 rounded-2xl text-text-dim hover:text-white transition-all w-full">
                        <LucideSettings size={22} />
                        {isExpanded && (
                            <motion.span 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-4 text-sm font-medium"
                            >
                                Configurações
                            </motion.span>
                        )}
                    </button>
                </div>

                {/* Expansion Indicator */}
                {!isExpanded && (
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <LucideChevronRight size={14} />
                    </div>
                )}
            </motion.div>
        </motion.nav>
    );
};

export default SidebarPrototype;
