import React, { useEffect } from "react";
import { Info, Mail, Globe } from "lucide-react";

const InstagramSVG = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const ContactDrawer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <>
      <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 overflow-y-auto flex flex-col font-sans animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl z-10 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> FADENA · UNDEF
            </div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Contacto e Info</h2>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-8">
          
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">Sitios Institucionales</h3>
            <div className="space-y-3">
              <a href="https://undef.edu.ar/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline">Sitio web UNDEF</p>
                  <p className="text-xs text-zinc-500 mt-0.5">undef.edu.ar</p>
                </div>
              </a>
              <a href="https://www.instagram.com/undef.arg/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <InstagramSVG className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:underline">Instagram UNDEF</p>
                  <p className="text-xs text-zinc-500 mt-0.5">@undef.arg</p>
                </div>
              </a>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4">Correos Electrónicos</h3>
            <div className="space-y-3">
              <a href="mailto:info@fadena.undef.edu.ar" className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Mesa de Entrada FADENA</p>
                  <p className="text-[13px] text-zinc-500 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">info@fadena.undef.edu.ar</p>
                </div>
              </a>
              
              <a href="mailto:licgestionpublica@fadena.undef.edu.ar" className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Dirección Gestión Pública</p>
                  <p className="text-[13px] text-zinc-500 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">licgestionpublica@fadena.undef.edu.ar</p>
                </div>
              </a>

              <a href="mailto:licciberdefensa@fadena.undef.edu.ar" className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Dirección Ciberdefensa</p>
                  <p className="text-[13px] text-zinc-500 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">licciberdefensa@fadena.undef.edu.ar</p>
                </div>
              </a>

              <a href="mailto:comunicacion@undef.edu.ar" className="flex items-start gap-4 p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group border border-transparent dark:border-zinc-800/50">
                <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-0.5">Comunicación UNDEF</p>
                  <p className="text-[13px] text-zinc-500 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">comunicacion@undef.edu.ar</p>
                </div>
              </a>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};
