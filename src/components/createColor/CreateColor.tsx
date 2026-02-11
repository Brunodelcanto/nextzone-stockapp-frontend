import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";
import { useNavigate } from "react-router-dom";
import { Palette, CheckCircle2, AlertCircle, ArrowLeft, Paintbrush } from "lucide-react";

interface ColorFormValues {
    name: string;
    hex: string;
}

interface CreateColorProps {
    onColorCreated: () => void;
}

const colorSchema = Joi.object<ColorFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "El nombre debe tener al menos 3 caracteres"
    }),
    hex: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .required()
        .messages({
            "string.pattern.base": "Debe ser un código hexadecimal válido (ej: #000000)",
            "string.empty": "El código HEX es obligatorio"
        })
});

const CreateColor = ({ onColorCreated }: CreateColorProps) => {
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register,reset, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<ColorFormValues>({
        resolver: joiResolver(colorSchema),
        defaultValues: {
            hex: "#000000"
        }
    });

    const currentHex = watch("hex");


    const onSubmit: SubmitHandler<ColorFormValues> = async (data) => {
        try {
            const response = await axios.post("http://localhost:3000/api/colors", data);
            if (!response.data.error) {
                setSuccessMessage("Color creado correctamente");
                setTimeout(() => setSuccessMessage(""), 2000);
                reset();
                onColorCreated();
        }
        } catch (err) {
            console.error("Error creating color:", err);
            setErrorMessage("Error al crear el color. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    return (
    <div className="p-10 max-w-xl mx-auto bg-white shadow-card rounded-[2.5rem] border border-slate-100 transition-all hover:shadow-card-hover mt-10 animate-in fade-in duration-700">
        
        {/* HEADER DEL FORMULARIO */}
        <div className="flex items-center gap-4 mb-10 border-b border-slate-50 pb-8">
            <div className="bg-primary/10 p-4 rounded-2xl text-primary">
                <Paintbrush className="w-8 h-8" />
            </div>
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Nuevo Color</h2>
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Configuración Estética • Next Zone</p>
            </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* MENSAJES DE ESTADO */}
            {errorMessage && (
                <div className="p-4 bg-accent-red/[0.08] border border-accent-red/20 text-accent-red text-xs font-black rounded-2xl animate-pulse flex items-center gap-3 uppercase tracking-wide">
                    <AlertCircle className="w-5 h-5" /> {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className="p-4 bg-accent-green/[0.08] border border-accent-green/20 text-accent-green text-xs font-black rounded-2xl animate-bounce flex items-center gap-3 uppercase tracking-wide">
                    <CheckCircle2 className="w-5 h-5" /> {successMessage}
                </div>
            )}

            {/* CAMPO: NOMBRE DEL COLOR */}
            <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">
                    Nombre Descriptivo
                </label>
                <div className="relative">
                    <Palette className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input 
                        {...register("name")}
                        placeholder="Ej: Azul Medianoche"
                        className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.name ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
                    />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-accent-red ml-2 mt-2 uppercase animate-pulse">{errors.name.message}</p>}
            </div>

            {/* CAMPO: CÓDIGO HEX CON PREVIEW MEJORADO */}
            <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">
                    Código Hexadecimal
                </label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 group-focus-within:text-primary transition-colors">#</span>
                        <input 
                            {...register("hex")}
                            placeholder="FFFFFF"
                            className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-10 pr-6 outline-none font-bold text-slate-700 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.hex ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
                        />
                    </div>
                    
                    {/* Vista previa con estilo de "Chip" */}
                    <div 
                        className="w-20 h-16 rounded-2xl border-4 border-white shadow-lg transition-transform hover:scale-110 duration-500"
                        style={{ 
                            backgroundColor: currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#F1F5F9",
                            boxShadow: `0 10px 15px -3px ${currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex + '40' : 'rgba(0,0,0,0.1)'}`
                        }}
                    />
                </div>
                {errors.hex && <p className="text-[10px] font-bold text-accent-red ml-2 mt-2 uppercase animate-pulse">{errors.hex.message}</p>}
            </div>

            {/* ACCIONES */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="group relative flex-1 overflow-hidden bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl active:scale-[0.98] cursor-pointer disabled:opacity-50 uppercase tracking-[0.2em] text-sm"
                >
                    <span className="relative z-10">{isSubmitting ? "Guardando..." : "Crear Color"}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                </button>
                
                <button 
                    type="button" 
                    onClick={() => navigate("/colors")}
                    className="flex-1 bg-slate-100 text-slate-500 font-black py-5 rounded-[1.5rem] hover:bg-slate-200 transition-all active:scale-[0.98] cursor-pointer uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancelar
                </button>
            </div>
        </form>
    </div>
);
};

export default CreateColor;