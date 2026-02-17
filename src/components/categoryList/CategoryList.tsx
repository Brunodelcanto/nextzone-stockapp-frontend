import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";
import { Search, Tags, Power, Trash2, AlertTriangle, CheckCircle2, AlertCircle, LayoutGrid } from 'lucide-react';

interface CategoryListProps {
    refreshTrigger: number;
}

const CategoryList = ({ refreshTrigger }: CategoryListProps) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);


    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
            setCategories(response.data.data); 
        } catch (err) {
            console.error("Error fetching categories:", err);
            setErrorMessage("Error al cargar las categorías. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta al montar y cada vez que refreshTrigger cambia (al crear una nueva)
    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            //
            const response = await axios.patch(`${import.meta.env.VITE_API_URL}/categories/${id}/${endpoint}`);
            
            if (!response.data.error) {
                setCategories(prev => prev.map(cat => 
                    cat._id === id ? { ...cat, isActive: !isActive } : cat
                ));
            }
            setSuccessMessage(isActive ? "Categoría desactivada correctamente" : "Categoría activada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error toggling product status:", err);
            setErrorMessage("No se puede desactivar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`);
            setCategories(prev => prev.filter(cat => cat._id !== id));
            setSuccessMessage("Categoría eliminada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error toggling product status:", err);
            setErrorMessage("No se puede eliminar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 font-bold">Cargando categorías...</div>;

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Organizando categorías...</p>
    </div>
);

return (
    <section className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* HEADER Y BUSCADOR */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Categorías</h1>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 opacity-80">Estructura de Inventario</p>
                </div>
            </div>
            
            <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar por nombre..." 
                    className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 outline-none font-bold text-slate-600 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* MENSAJES DE ESTADO */}
        <div className="max-w-5xl mx-auto space-y-4 mb-8">
            {errorMessage && (
                <div className="p-4 bg-accent-red/[0.08] border border-accent-red/20 text-accent-red text-xs font-black rounded-2xl animate-pulse flex items-center gap-3 uppercase tracking-wide">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-accent-green/[0.08] border border-accent-green/20 text-accent-green text-xs font-black rounded-2xl animate-bounce flex items-center gap-3 uppercase tracking-wide">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMessage}
                </div>
            )}
        </div>

        {/* GRID DE CATEGORÍAS */}
<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredCategories.map(category => (
        <div 
            key={category._id}
            onClick={() => navigate(`/edit-category/${category._id}`)}
            className={`group bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col justify-between transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 cursor-pointer relative overflow-hidden
                ${!category.isActive ? 'opacity-50 grayscale' : 'opacity-100'}`}
        >
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <Tags className={`w-10 h-10 ${category.isActive ? 'text-primary' : 'text-slate-300'} transition-colors duration-500`} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter leading-tight group-hover:text-primary transition-colors italic mb-10">
                    {category.name}
                </h3>
            </div>

            <div className="relative z-10">
                {/* INDICADOR DE ESTADO UNIFICADO (DOT) */}
                <div className="flex items-center gap-2 mb-6">
                    <div className={`w-2.5 h-2.5 rounded-full ${category.isActive ? 'bg-accent-green animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {category.isActive ? 'Activo' : 'Pausado'}
                    </span>
                </div>

                <div className="flex gap-3 mt-4">
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(category._id, category.isActive);
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm cursor-pointer
                            ${category.isActive 
                                ? 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white' 
                                : 'bg-primary text-white shadow-primary/20'}`}
                    >
                        <Power className="w-3.5 h-3.5" />
                        {category.isActive ? "Pausar" : "Activar"}
                    </button>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowModal(category._id);
                        }}
                        className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-accent-red hover:text-white hover:shadow-lg hover:shadow-accent-red/20 transition-all duration-300 active:scale-95 group/del cursor-pointer"
                    >
                        <Trash2 className="w-5 h-5 group-hover/del:scale-110" />
                    </button>
                </div>
            </div>
        </div>
    ))}
</div>

        {/* ESTADO VACÍO */}
        {filteredCategories.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                <Search className="w-12 h-12 text-slate-100" />
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No se encontraron categorías en Next Zone</p>
            </div>
        )}

        {/* MODAL DE ELIMINACIÓN NEXTZONE */}
        {showModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-red">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic">¿Eliminar Categoría?</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">Esta operación fallará si existen productos vinculados a este grupo.</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => { handleDelete(showModal); setShowModal(null); }}
                            className="w-full bg-accent-red text-white font-black py-4 rounded-2xl shadow-lg shadow-accent-red/20 hover:bg-red-700 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            Confirmar Baja
                        </button>
                        <button 
                            onClick={() => setShowModal(null)}
                            className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        )}
    </section>
);
};

export default CategoryList;