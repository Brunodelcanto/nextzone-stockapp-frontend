import { useState } from "react";
import CreateSale from "../../components/createSale/CreateSale";
import SalesList from "../../components/saleList/SaleList";
import { Receipt } from 'lucide-react';

const SalePage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-700">
        {/* HEADER DE LA PÁGINA */}
        <header className="max-w-[1600px] mx-auto mb-10 flex items-center gap-4 px-4">
            <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
                <Receipt className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">
                    Gestión de Ventas
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 opacity-80">
                    Panel de Control • Next Zone System
                </p>
            </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="max-w-[1600px] mx-auto space-y-12">
            
            {/* SECCIÓN DE CREACIÓN: Usamos un contenedor con ID para anclaje si fuera necesario */}
            <section id="create-sale-section" className="animate-in slide-in-from-bottom-6 duration-700 delay-150">
                <div className="flex items-center gap-3 mb-6 px-4">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight">Nueva Operación</h2>
                </div>
                <CreateSale onSaleCreated={() => setRefreshTrigger(prev => prev + 1)} />
            </section>

            {/* DIVISOR ESTÉTICO */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mx-10" />

            {/* SECCIÓN DE HISTORIAL Y REPORTES */}
            <section id="sales-list-section" className="animate-in slide-in-from-bottom-6 duration-700 delay-300">
                <div className="flex items-center gap-3 mb-6 px-4">
                    <div className="w-2 h-8 bg-slate-300 rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight">Historial de Reportes</h2>
                </div>
                <SalesList refreshTrigger={refreshTrigger} />
            </section>
        </main>

        {/* FOOTER SUTIL */}
        <footer className="max-w-[1600px] mx-auto mt-20 pb-10 px-4 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                Next Zone Stock System © 2026 • San Lorenzo
            </p>
        </footer>
    </div>
);
}

export default SalePage;