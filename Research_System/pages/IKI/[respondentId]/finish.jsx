import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '@xcorphion/platform/src/components/xcorphion/Layout';

export default function ResearchFinishPage() {
    const router = useRouter();
    const { respondentId } = router.query;

    return (
        <Layout>
            <Head>
                <title>Gratidão pela Entrega | XCORPION</title>
            </Head>

            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 font-inter text-center">
                
                <div className="max-w-2xl animate-in fade-in zoom-in duration-1000">
                    <div className="mb-12 flex justify-center">
                        <div className="w-20 h-20 rounded-full border border-[#8B0000] flex items-center justify-center text-3xl text-[#8B0000] shadow-[0_0_30px_rgba(139,0,0,0.2)] animate-pulse">
                            <i className="ph ph-heart"></i>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-space mb-8 tracking-tight leading-tight">
                        Sua essência foi capturada.
                    </h1>

                    <div className="space-y-6 text-white/70 text-xl leading-relaxed font-light max-w-xl mx-auto">
                        <p>
                            <span className="text-white font-medium">Xcorphion</span> agradece por sua entrega e autenticidade. 
                            Sua jornada apenas começou; esperamos vê-lo(a) novamente para a 
                            <span className="text-[#8B0000] font-bold mx-1">segunda sessão</span>, 
                            onde exploraremos novos horizontes de sua expressão somática.
                        </p>
                    </div>

                    <div className="mt-16 flex flex-col items-center gap-6">
                        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        <a
                            href={`${process.env.NEXT_PUBLIC_PLATFORM_URL || 'https://xcorphion.online'}/study?code=${respondentId}`}
                            className="inline-flex items-center gap-3 bg-[#8B0000] hover:bg-[#9e0000] text-white text-sm font-medium px-8 py-3.5 rounded-lg transition-all duration-300 shadow-[0_0_24px_rgba(139,0,0,0.25)] hover:shadow-[0_0_40px_rgba(139,0,0,0.45)]"
                        >
                            Entrar na lista de espera do OMMΩ
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </a>
                        <button
                            onClick={() => router.push('/')}
                            className="text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all duration-500 hover:tracking-[0.6em]"
                        >
                            Retornar ao Início
                        </button>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @keyframes animateIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: animateIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                }
            `}</style>
        </Layout>
    );
}
