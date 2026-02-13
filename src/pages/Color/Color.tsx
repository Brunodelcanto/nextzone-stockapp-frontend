import { useEffect, useState } from "react";
import ColorList from "../../components/colorList/ColorList";
import CreateColor from "../../components/createColor/CreateColor";
import { Palette } from 'lucide-react';

const ColorPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
            const timer = setTimeout(() => setLoading(false), 100);
            return () => clearTimeout(timer);
        }, []);

     if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
             <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

   return (
     <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        {/* HEADER DE LA PÁGINA DE ESTILO */}
        <header className="max-w-[1600px] mx-auto mb-10 flex items-center gap-5 px-4">
            <div className="bg-primary p-4 rounded-[1.5rem] shadow-xl shadow-primary/20 transition-transform hover:rotate-6 duration-300">
                <Palette className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">
                    Estudio de Colores
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 opacity-80">
                    Paleta de Identidad • Next Zone System
                </p>
            </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="max-w-[1600px] mx-auto space-y-16">
            
            {/* SECCIÓN DE CREACIÓN: CreateColor */}
            <section id="add-color-section" className="animate-in slide-in-from-top-6 duration-1000">
                <div className="flex items-center gap-3 mb-8 px-6">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight italic">Añadir Nueva Tonalidad</h2>
                </div>
                <CreateColor onColorCreated={() => setRefreshTrigger(prev => prev + 1)} />
            </section>

            {/* DIVISOR ESTÉTICO NEXTZONE */}
            <div className="relative h-px bg-slate-200 mx-10">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                    Explorar colores
                </div>
            </div>

            {/* SECCIÓN DE LISTADO: ColorList */}
            <section id="color-list-section" className="animate-in slide-in-from-bottom-6 duration-1000 delay-200">
                <div className="flex items-center gap-3 mb-8 px-6">
                    <div className="w-2 h-8 bg-slate-300 rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight italic">Galería de Colores</h2>
                </div>
                <ColorList refreshTrigger={refreshTrigger} />
            </section>
        </main>

        {/* FOOTER DE PÁGINA */}
        <footer className="max-w-[1600px] mx-auto mt-24 pb-12 px-4 text-center border-t border-slate-100 pt-10">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
               Next Zone Stock System • San Lorenzo • 2026
            </p>
        </footer>
    </div>
);
}

export default ColorPage;