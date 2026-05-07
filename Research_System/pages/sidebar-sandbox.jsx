import Head from 'next/head';
import SidebarPrototype from '@xcorphion/platform/src/components/xcorphion/SidebarPrototype';

export default function SidebarSandbox() {
  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden flex items-center justify-center">
      <Head>
        <title>Sidebar Prototype Sandbox</title>
      </Head>
      
      {/* Background decorativo apenas para contraste no sandbox */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,#8B0000_0%,transparent_50%)]" />
      </div>

      <SidebarPrototype />
      
      <div className="max-w-xl text-center z-10">
        <h1 className="font-space text-4xl font-black text-white/20 mb-4 tracking-tighter">
          SIDEBAR SANDBOX
        </h1>
        <p className="font-mono text-xs text-white/10 uppercase tracking-widest">
          Experimentação isolada de navegação lateral
        </p>
      </div>
    </div>
  );
}
