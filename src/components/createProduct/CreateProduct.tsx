import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import type {SubmitHandler } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi"; 
import type { Category, Color, ColorVariant } from "../../types/index";
import Joi from "joi";
import { PackagePlus, Image as ImageIcon, Plus, Trash2, CheckCircle2, AlertCircle, X } from "lucide-react";
import imageCompression from "browser-image-compression";

interface ProductFormValues {
    name: string;
    category: string;
    minStockAlert: number;
    variants: ColorVariant[];
    image: FileList | null;
}

interface CreateProductProps {
    onProductCreated: () => void;
}

const validationSchema = Joi.object<ProductFormValues>({
    name: Joi.string().min(3).max(50).required().messages({
        "string.base": "El nombre debe ser un texto",
        "string.empty": "El nombre es requerido",
        "string.min": "El nombre debe tener al menos 3 caracteres",
    }),
    category: Joi.string().required().messages({
        "string.empty": "La categoría es requerida",}),
    minStockAlert: Joi.number().default(5),
    variants: Joi.array().items(
        Joi.object({
            color: Joi.string().required().messages({
                "string.empty": "El color es requerido",
            }),
            amount: Joi.number().min(0).required().messages({
                "string.empty": "La cantidad es requerida",
                "number.base": "La cantidad debe ser un número",
                "number.min": "La cantidad no puede ser negativa",
            }),
            priceCost: Joi.number().min(0).required().messages({
                "string.empty": "El precio de costo es requerido",
                "number.base": "El precio de costo debe ser un número",
                "number.min": "El precio de costo no puede ser negativo",
            }),
            priceSell: Joi.number().min(0).required().messages({
                "string.empty": "El precio de venta es requerido",
                "number.base": "El precio de venta debe ser un número",
                "number.min": "El precio de venta no puede ser negativo",
            }),
        }).min(1).required().messages({
            "array.min": "Debe haber al menos una variación de color",
        }),
    ),
    image: Joi.any().required().messages({
    "any.required": "La imagen es obligatoria"
     })
})

const CreateProduct = ({ onProductCreated }: CreateProductProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(false);
    const [preview , setPreview] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { register, control, handleSubmit, reset, resetField, watch, formState: { errors } } = useForm<ProductFormValues>({
        resolver: joiResolver(validationSchema),
        defaultValues: {
            name: "",
            category: "",
            minStockAlert: 5,
            variants: [{ color: "", amount: 0, priceCost: 0, priceSell: 0 }]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "variants" });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [resCats, resCols] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/categories`),
                    axios.get(`${import.meta.env.VITE_API_URL}/colors`)
                ]);
                setCategories(resCats.data.data);
                setColors(resCols.data.data);
            } catch (error) {
                console.error("Error cargando selectores:", error);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
    if (Object.keys(errors).length > 0) {
        console.log("Errors in validations:", errors);
    }
}, [errors]);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        const selectedColors = data.variants.map(v => v.color);
        const hasDuplicates = selectedColors.some((color, index) => selectedColors.indexOf(color) !== index);
        
        if (hasDuplicates) {
            setErrorMessage("No puedes agregar el mismo color más de una vez");
            setTimeout(() => setErrorMessage(""), 2000);
            setLoading(false);
            return;
        }
        
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());
            formData.append("variants", JSON.stringify(data.variants));

            if (data.image && data.image[0]) {
                const originalFile = data.image[0];

                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true,
                };

                try {
                const compressedBlob = await imageCompression(originalFile, options);
                
                const compressedFile = new File([compressedBlob], originalFile.name, {
                    type: originalFile.type,
                     lastModified: Date.now(),
                });

                formData.append("image", compressedFile);
                
            } catch (compressionError) {
                console.error("Error al comprimir la imagen:", compressionError);
                formData.append("image", originalFile);
            }
        }
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
                headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` }
            });

            setSuccessMessage("¡Producto cargado con éxito!");
            setTimeout(() => setSuccessMessage(""), 2000);
            setPreview(null);
            reset();
            onProductCreated();
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setErrorMessage(error.response?.data?.message || "Error al crear producto");
            setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string); 
        };
        reader.readAsDataURL(file);
    } else {
        setPreview(null);
    }
};

const clearImage = () => {
    setPreview(null);
    resetField("image"); 
};

const handleClearForm = () => {
    reset();
    setPreview(null);
};

   return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-10 bg-white rounded-[3rem] shadow-card border border-slate-100 transition-all hover:shadow-card-hover animate-in fade-in duration-700">
        
        {/* HEADER DEL FORMULARIO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 border-b border-slate-50 pb-8">
    <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-4 rounded-2xl text-primary flex-shrink-0">
            <PackagePlus className="w-8 h-8" />
        </div>
        <div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-tight">Nuevo Producto</h2>
            <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-[0.3em] mt-1">Carga de inventario • Next Zone</p>
        </div>
    </div>

    <button 
        type="button"
        onClick={handleClearForm}
        className="flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-accent-red transition-all duration-300 group/clear active:scale-90 cursor-pointer bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none"
    >
        <Trash2 className="w-4 h-4 group-hover/clear:rotate-12" />
        <span>Vaciar Formulario</span>
    </button>
</div>

        

        {/* MENSAJES DE ESTADO */}
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

        {/* SECCIÓN 1: DATOS BÁSICOS E IMAGEN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-6">
                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Nombre del Producto</label>
                    <input 
                        {...register("name")} 
                        className={`w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.name ? 'border-accent-red/30' : ''}`}
                        placeholder="Ej: iPhone 15 Pro Max"
                    />
                    {errors.name && <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase animate-pulse">{errors.name.message}</span>}
                </div>

                <div className="group relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">
                 Categoría
                </label>
                <div className="relative">
                    <select 
                    {...register("category")} 
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-4 px-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer appearance-none relative z-10"
                    >
                    <option value="" className="font-sans text-slate-900">Seleccionar categoría...</option>
                    {categories.map(c => (
                        <option key={c._id} value={c._id} className="font-sans text-slate-900">
                        {c.name}
                        </option>
                    ))}
                    </select>

                    {/* Flecha personalizada de Nextzone */}
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-slate-300 group-focus-within:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 9 6 6 6-6"/>
                    </svg>
                    </div>
                </div>
                {errors.category && (
                    <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase animate-pulse">
                    {errors.category.message}
                    </span>
                )}
            </div>
            </div>

            {/* CARGA DE IMAGEN CON PREVIEW */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-6 bg-slate-50/50 hover:bg-white hover:border-primary/30 transition-all group relative overflow-hidden">
                {!preview ? (
                    <label className="flex flex-col items-center gap-3 cursor-pointer">
                        <div className="bg-white p-4 rounded-full shadow-sm text-slate-300 group-hover:text-primary transition-colors">
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subir Imagen</span>
                        <input type="file" {...register("image")} accept="image/*" className="hidden" onChange={(e) => {register("image").onChange(e); handleImageChange(e)}} />
                    </label>
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center animate-in zoom-in-75 duration-300">
                        <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-2xl shadow-lg border-4 border-white" />
                        <button type="button" onClick={clearImage} className="absolute top-0 right-0 bg-accent-red text-white p-2 rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                {errors.image && <span className="absolute bottom-2 text-[10px] font-black text-accent-red uppercase tracking-widest animate-pulse">{errors.image.message}</span>}
            </div>
        </div>

        {/* SECCIÓN 2: VARIANTES DE COLOR */}
        <div className="space-y-6 mb-10">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic">Configuración de Variantes</h3>
                <button type="button" onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0 })} className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all cursor-pointer">
                    <Plus className="w-4 h-4" /> Agregar Variante
                </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
                        <div className="md:col-span-1">
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Color</label>
                            <select {...register(`variants.${index}.color` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary transition-all">
                                <option value="">Color...</option>
                                {colors.map(c => {
                                // Verificamos si este color ya fue seleccionado en OTRA fila
                                const isAlreadySelected = fields.some((_, idx) => 
                                    idx !== index && watch(`variants.${idx}.color`) === c._id
                                );

                                return (
                                    <option 
                                        key={c._id} 
                                        value={c._id} 
                                        disabled={isAlreadySelected} // Bloquea el color si ya está en uso
                                    >
                                        {c.name} {isAlreadySelected ? "(Ya seleccionado)" : ""}
                                    </option>
                                );
                            })}
                        </select>
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Stock</label>
                            <input type="number" {...register(`variants.${index}.amount` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Costo ($)</label>
                            <input type="number" step="0.01" {...register(`variants.${index}.priceCost` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary text-accent-orange" />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase ml-1 mb-1">Venta ($)</label>
                            <input type="number" step="0.01" {...register(`variants.${index}.priceSell` as const)} className="w-full bg-white border-2 border-slate-100 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary text-accent-green" />
                        </div>
                        <div className="flex justify-end">
                            <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className={`p-3 rounded-xl transition-all ${fields.length === 1 ? 'opacity-20' : 'text-slate-300 hover:text-accent-red hover:bg-accent-red/10 cursor-pointer hover:scale-110'}`}>
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* BOTÓN FINAL */}
        <button 
            type="submit" 
            disabled={loading} 
            className="group relative w-full overflow-hidden bg-primary text-white font-black py-5 rounded-[2rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl active:scale-[0.98] cursor-pointer disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
        >
            <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? "Procesando..." : "Finalizar Carga de Producto"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        </button>
    </form>
);
};

export default CreateProduct;