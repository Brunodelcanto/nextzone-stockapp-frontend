import { useState } from "react";
import CategoryList from "../../components/categoryList/CategoryList";
import CreateCategory from "../../components/createCategory/CreateCategory";
import { LayoutGrid } from 'lucide-react';

const CategoryPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 animate-in fade-in duration-700">
        
        {/* HEADER DE LA PÁGINA DE CATEGORÍAS */}
        <header className="max-w-[1600px] mx-auto mb-10 flex items-center gap-5 px-4">
            <div className="bg-primary p-4 rounded-[1.5rem] shadow-xl shadow-primary/20 transition-transform hover:-rotate-6 duration-300">
                <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase leading-none italic">
                    Estructura de Stock
                </h1>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em] mt-2 opacity-80">
                    Gestión de Categorías • Next Zone System
                </p>
            </div>
        </header>

        {/* CONTENEDOR PRINCIPAL */}
        <main className="max-w-[1600px] mx-auto space-y-16">
            
            {/* SECCIÓN DE CREACIÓN: CreateCategory */}
            <section id="add-category-section" className="animate-in slide-in-from-top-6 duration-1000">
                <div className="flex items-center gap-3 mb-8 px-6">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight italic">Añadir Clasificación</h2>
                </div>
                <CreateCategory onCategoryCreated={() => setRefreshTrigger(prev => prev + 1)} />
            </section>

            {/* DIVISOR ESTÉTICO NEXTZONE */}
            <div className="relative h-px bg-slate-200 mx-10">
                <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-50 px-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
                    Grupos Configurados
                </div>
            </div>

            {/* SECCIÓN DE LISTADO: CategoryList */}
            <section id="category-list-section" className="animate-in slide-in-from-bottom-6 duration-1000 delay-200">
                <div className="flex items-center gap-3 mb-8 px-6">
                    <div className="w-2 h-8 bg-slate-300 rounded-full" />
                    <h2 className="text-xl font-black text-slate-700 uppercase tracking-tight italic">Listado Maestro</h2>
                </div>
                <CategoryList refreshTrigger={refreshTrigger} />
            </section>
        </main>

        {/* FOOTER DE PÁGINA */}
        <footer className="max-w-[1600px] mx-auto mt-24 pb-12 px-4 text-center border-t border-slate-100 pt-10">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em]">
                Data Architecture • San Lorenzo • Next Zone 2026
            </p>
        </footer>
    </div>
);
};

export default CategoryPage;