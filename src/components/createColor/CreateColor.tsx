import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";
import { useNavigate } from "react-router-dom";

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
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Crear Nuevo Color</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMessage && <div className="p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
            {successMessage && <div className="p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Color</label>
                    <input 
                        {...register("name")}
                        placeholder="Ej: Rojo Mate"
                        className={`w-full p-2 border rounded mt-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Código Hexadecimal</label>
                        <input 
                            {...register("hex")}
                            placeholder="#000000"
                            className={`w-full p-2 border rounded mt-1 ${errors.hex ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    
                    {/* Vista previa del color en vivo */}
                    <div 
                        className="w-12 h-10 rounded border shadow-sm"
                        style={{ backgroundColor: currentHex.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#eee" }}
                    />
                </div>
                {errors.hex && <p className="text-red-500 text-xs mt-1">{errors.hex.message}</p>}

                <div className="flex gap-3 pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isSubmitting ? "Guardando..." : "CREAR COLOR"}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate("/colors")}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded font-bold hover:bg-gray-300"
                    >
                        CANCELAR
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateColor;