import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import api from "../../api/axiosConfig";
import Joi from "joi";
import type { ProductFormValues, Category, Color, ColorVariant } from "../../types/index";
import { Edit3, Package, Image as ImageIcon, Plus, Trash2, CheckCircle2, AlertCircle, X, ArrowLeft } from "lucide-react";

const editSchema = Joi.object<ProductFormValues>({
    name: Joi.string().min(3).required().messages({
        "any.required": "El nombre es obligatorio",
        "string.empty": "El nombre no puede estar vacío",
        "string.min": "El nombre debe tener al menos 3 caracteres"
    }),
    category: Joi.string().min(3).required().messages({
        "any.required": "La categoría es obligatoria",
        "string.empty": "La categoría no puede estar vacía",
        "string.min": "La categoría debe tener al menos 3 caracteres"
    }),
    minStockAlert: Joi.number().default(5).min(0).required().messages({
        "any.required": "La alerta de stock es obligatoria",
        "number.base": "La alerta de stock debe ser un número",
        "number.min": "La alerta de stock no puede ser negativa"
    }),
    variants: Joi.array().items(
        Joi.object({
            _id: Joi.string().optional(),
            color: Joi.string().required(),
            amount: Joi.number().min(0).required().messages({
                "any.required": "El color es obligatorio",
                "string.empty": "El color no puede estar vacío"
            }),
            priceCost: Joi.number().min(0).required().messages({
                "any.required": "El precio de costo es obligatorio",
                "number.base": "El precio de costo debe ser un número",
                "number.min": "El precio de costo no puede ser negativo"
            }),
            priceSell: Joi.number().min(0).required().messages({
                "any.required": "El precio de venta es obligatorio",
                "number.base": "El precio de venta debe ser un número",
                "number.min": "El precio de venta no puede ser negativo"
            })
        })
    ).min(1).required(),
    image: Joi.any().optional()
});

const EditProduct = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { register, control, handleSubmit, reset, resetField, formState: { errors } } = useForm<ProductFormValues>({
        resolver: joiResolver(editSchema)
    });

    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [resProduct, resCats, resCols] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/categories`),
                    api.get(`/colors`)
                ]);

                const p = resProduct.data.data;
                setCategories(resCats.data.data);
                setColors(resCols.data.data);

                reset({
                    name: p.name,
                    category: typeof p.category === 'object' ? p.category._id : p.category,
                    minStockAlert: p.minStockAlert,
                    variants: p.variants.map((v: ColorVariant) => ({
                        _id: v._id,
                        color: typeof v.color === 'object' ? v.color._id : v.color,
                        amount: v.amount,
                        priceCost: v.priceCost,
                        priceSell: v.priceSell
                    }))
                });

                if (p.image?.url) setPreview(p.image.url);
            } catch (err) {
                console.error("Error cargando producto", err);
                navigate("/products");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, reset, navigate]);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());
            formData.append("variants", JSON.stringify(data.variants));

            if (data.image && data.image[0]) {
                formData.append("image", data.image[0]);
            }

            await api.put(`/products/${id}`, formData);
            setSuccessMessage("¡Producto actualizado!");
            setTimeout(() => setSuccessMessage(""), 2000);
            navigate("/products");
        } catch (err) {
            console.error(err);
            setErrorMessage("Error al actualizar");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Cargando producto...</p>
    </div>
);

return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-10 bg-white rounded-[3rem] shadow-card border border-slate-100 transition-all hover:shadow-card-hover animate-in fade-in duration-700">
        
        {/* HEADER DE EDICIÓN */}
        <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                <Edit3 className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Editar Producto</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Gestión de Stock • Next Zone</p>
            </div>
        </div>

        {/* MENSAJES DE ESTADO TITILANTES */}
        {successMessage && (
            <div className="mb-8 p-4 bg-accent-green/[0.08] border border-accent-green/20 text-accent-green text-xs font-black rounded-2xl animate-bounce flex items-center gap-3 uppercase tracking-wide">
                <CheckCircle2 className="w-5 h-5" /> {successMessage}
            </div>
        )}
        {errorMessage && (
            <div className="mb-8 p-4 bg-accent-red/[0.08] border border-accent-red/20 text-accent-red text-xs font-black rounded-2xl animate-pulse flex items-center gap-3 uppercase tracking-wide">
                <AlertCircle className="w-5 h-5" /> {errorMessage}
            </div>
        )}

        {/* SECCIÓN 1: DATOS GENERALES E IMAGEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Nombre del Producto</label>
                    <input 
                        {...register("name")} 
                        className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.name ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
                    />
                    {errors.name && <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase animate-pulse">{errors.name.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest">Categoría</label>
                        <select {...register("category")} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-4 outline-none font-bold text-slate-700 transition-all focus:bg-white focus:border-primary appearance-none cursor-pointer">
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="group">
                        <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest">Alerta Stock</label>
                        <input type="number" {...register("minStockAlert")} className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-4 outline-none font-bold text-slate-700 focus:bg-white focus:border-primary" />
                    </div>
                </div>
            </div>

            {/* PREVIEW DE IMAGEN ESTILO PREMIUM */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-6 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all group relative overflow-hidden">
                {!preview ? (
                    <label className="flex flex-col items-center gap-3 cursor-pointer">
                        <div className="bg-white p-4 rounded-full shadow-sm text-slate-300 group-hover:text-primary transition-colors">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Cambiar Imagen</span>
                        <input type="file" {...register("image")} accept="image/*" className="hidden" 
                            onChange={(e) => {
                                register("image").onChange(e); 
                                const file = e.target.files?.[0];
                                if (file) setPreview(URL.createObjectURL(file));
                            }} 
                        />
                    </label>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-300">
                        <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white" />
                        <button type="button" onClick={() => { setPreview(null); resetField("image"); }} className="absolute top-0 right-0 bg-accent-red text-white p-2 rounded-full shadow-xl hover:scale-110 transition-all cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* SECCIÓN VARIANTES */}
        <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic flex items-center gap-2">
                   <Package className="w-4 h-4" /> Variantes de Stock
                </h3>
                <button type="button" onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0 })} className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" /> Nueva Variante
                </button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                        <div className="md:col-span-4">
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Color</label>
                            <select {...register(`variants.${index}.color` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary appearance-none cursor-pointer transition-all">
                                {colors.map(col => <option key={col._id} value={col._id}>{col.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Stock</label>
                            <input type="number" {...register(`variants.${index}.amount` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Venta ($)</label>
                            <input type="number" {...register(`variants.${index}.priceSell` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary text-accent-green" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Costo ($)</label>
                            <input type="number" {...register(`variants.${index}.priceCost` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary text-accent-orange" />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className={`p-3 rounded-xl transition-all ${fields.length === 1 ? 'opacity-20' : 'text-slate-300 hover:text-accent-red hover:bg-accent-red/10 cursor-pointer hover:scale-110'}`}>
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* ACCIONES FINALES */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button type="submit" className="group relative flex-[2] overflow-hidden bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl active:scale-[0.98] cursor-pointer uppercase tracking-[0.2em] text-sm">
                <span className="relative z-10">Guardar Cambios</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            </button>
            <button type="button" onClick={() => navigate("/products")} className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-[2.5rem] hover:bg-slate-200 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Cancelar
            </button>
        </div>
    </form>
);
};

export default EditProduct;