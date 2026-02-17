import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import type { Color } from "../../types";
import { Search, Power, Trash2, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface ColorListProps {
    refreshTrigger: number
}

const ColorList = ({ refreshTrigger }: ColorListProps) => {
    const navigate = useNavigate();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchColors = async () => {
        try {
            const response = await api.get(`/colors`);
            setColors(response.data.data);
        } catch (err) {
            console.error("Error fetching colors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColors();
    }, [refreshTrigger]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            await api.patch(`/colors/${id}/${endpoint}`);
            setColors(prev => prev.map(c => c._id === id ? { ...c, isActive: !isActive } : c));
            setSuccessMessage(isActive ? "Color desactivado correctamente" : "Color activado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
             console.error("Error toggling product status:", err);
            setErrorMessage("No se puede desactivar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/colors/${id}`);
            setColors(prev => prev.filter(c => c._id !== id));
            setSuccessMessage("Color eliminado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error deleting color:", err);
            setErrorMessage("No se puede eliminar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const filteredColors = colors.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Cargando paleta de Nextzone...</p>
    </div>
);

return (
    <section className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* HEADER DE SECCIÓN */}
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Gestión de Colores</h1>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-3 opacity-80">Configuración Visual • Inventario</p>
            </div>
            
            {/* BUSCADOR INTEGRADO */}
            <div className="relative group w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Filtrar colores..." 
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

 {/* GRID DE MUESTRAS DE COLOR */}
<div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredColors.map(color => (
        <div 
            key={color._id}
            onClick={() => navigate(`/edit-color/${color._id}`)}
            className={`group bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col items-center transition-all duration-500 hover:shadow-card-hover hover:-translate-y-2 cursor-pointer relative overflow-hidden
                ${!color.isActive ? 'opacity-50 grayscale' : 'opacity-100'}`}
        >
            {/* Línea decorativa superior */}
            <div 
                className="absolute top-0 left-0 w-full h-2 transition-all duration-500 group-hover:h-3"
                style={{ backgroundColor: color.hex }}
            />

            {/* Muestra circular */}
            <div 
                className="w-24 h-24 rounded-full border-8 border-slate-50 mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-inner relative"
                style={{ 
                    backgroundColor: color.hex,
                    boxShadow: `0 20px 25px -5px ${color.hex + '30'}` 
                }}
            >
                <div className="absolute inset-0 rounded-full border border-black/5 shadow-inner" />
            </div>
            
            <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter mb-1 group-hover:text-primary transition-colors italic">
                {color.name}
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{color.hex}</p>

            {/* INDICADOR DE ESTADO UNIFICADO (DOT) */}
            <div className="w-full flex items-center gap-2 mb-6 px-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color.isActive ? 'bg-accent-green animate-pulse' : 'bg-slate-300'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {color.isActive ? 'Activo' : 'Pausado'}
                </span>
            </div>

            {/* ACCIONES RÁPIDAS */}
            <div className="flex gap-3 w-full relative z-10">
                <button 
                    onClick={(e) => {e.stopPropagation(); handleToggleActive(color._id, color.isActive || false)}}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 shadow-sm cursor-pointer
                        ${color.isActive 
                            ? 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white' 
                            : 'bg-primary text-white shadow-primary/20'}`}
                >
                    <Power className="w-3.5 h-3.5" />
                    {color.isActive ? "Pausar" : "Activar"}
                </button>
                
                <button 
                    onClick={(e) => {e.stopPropagation(); setShowModal(color._id)}}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-accent-red hover:text-white hover:shadow-lg hover:shadow-accent-red/20 transition-all duration-300 active:scale-95 group/del cursor-pointer"
                >
                    <Trash2 className="w-5 h-5 group-hover/del:scale-110" />
                </button>
            </div>
        </div>
    ))}
</div>

        {/* MODAL DE ELIMINACIÓN NEXTZONE */}
        {showModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in zoom-in-95">
                    <div className="w-20 h-20 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-red">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2 italic">¿Eliminar Color?</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">Si este color está en uso, la operación será rechazada automáticamente.</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => { handleDelete(showModal); setShowModal(null); }}
                            className="w-full bg-accent-red text-white font-black py-4 rounded-2xl shadow-lg shadow-accent-red/20 hover:bg-red-700 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            Confirmar Borrado
                        </button>
                        <button 
                            onClick={() => setShowModal(null)}
                            className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            Mantener Color
                        </button>
                    </div>
                </div>
            </div>
        )}
    </section>
);
};

export default ColorList;