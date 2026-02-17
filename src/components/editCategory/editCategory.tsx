import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";
import { Edit3, Tags, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

interface CategoryFormValues {
    name: string;
}

const categorySchema = Joi.object<CategoryFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Mínimo 3 caracteres"
    })
});

const EditCategory = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
        resolver: joiResolver(categorySchema)
    });

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/categories/${id}`);
                const categoryData = response.data.data;
                reset({
                    name: categoryData.name
                });
            } catch (err) {
                console.error("Error al actualizar la categoría", err);
                setErrorMessage("Error al cargar la categoría. Por favor, intenta nuevamente.");
                setTimeout(() => setErrorMessage(null), 2000);
                navigate("/categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id, reset, navigate]);

    const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/categories/${id}`, data);
            setSuccessMessage("¡Categoría actualizada!");
            setTimeout(() => setSuccessMessage(null), 2000);
            navigate("/categories");
        } catch (err) {
            console.error("Error al actualizar la categoría", err);
            setErrorMessage("Error al actualizar la categoría. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(null), 2000);
        }
    };

    if (loading) return <div className="text-center p-10">Cargando categoría...</div>;

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Cargando categoría...</p>
    </div>
);

return (
    <div className="p-10 max-w-xl mx-auto bg-white shadow-card rounded-[2.5rem] border border-slate-100 hover:shadow-card-hover mt-10">
        
        {/* HEADER DE EDICIÓN */}
        <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                <Edit3 className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Editar Categoría</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Estructura de Inventario • Next Zone</p>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* MENSAJES DE ESTADO */}
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

            {/* CAMPO: NOMBRE DE CATEGORÍA */}
            <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">
                    Nombre Actualizado
                </label>
                <div className="relative">
                    <Tags className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input 
                        {...register("name")}
                        placeholder="Ej: Accesorios Premium"
                        className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.name ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
                    />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-accent-red ml-2 mt-2 uppercase animate-pulse">{errors.name.message}</p>}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="group relative flex-[2] overflow-hidden bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl active:scale-[0.98] cursor-pointer disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                >
                    <span className="relative z-10">{isSubmitting ? "Guardando..." : "Guardar Cambios"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </button>
                
                <button 
                    type="button" 
                    onClick={() => navigate("/categories")}
                    className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-[1.5rem] hover:bg-slate-200 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancelar
                </button>
            </div>
        </form>
    </div>
);
};

export default EditCategory;