import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";

interface ColorFormValues {
    name: string;
    hex: string;
}

const colorSchema = Joi.object<ColorFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Mínimo 3 caracteres"
    }),
    hex: Joi.string()
        .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .required()
        .messages({
            "string.pattern.base": "Formato HEX inválido (ej: #FF5733)"
        })
});

const EditColor = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ColorFormValues>({
        resolver: joiResolver(colorSchema)
    });

    const currentHex = watch("hex");

    useEffect(() => {
        const fetchColor = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/colors/${id}`);
                const colorData = response.data.data;
                setSuccessMessage("Color cargado correctamente");
                setTimeout(() => setSuccessMessage(null), 2000);
                reset({
                    name: colorData.name,
                    hex: colorData.hex
                });
            } catch (err) {
                console.error("Error al actualizar el color", err);
                setErrorMessage("Error al cargar el color. Por favor, intenta nuevamente.");
                setTimeout(() => setErrorMessage(null), 2000);
                navigate("/colors");
            } finally {
                setLoading(false);
            }
        };
        fetchColor();
    }, [id, reset, navigate]);

    const onSubmit: SubmitHandler<ColorFormValues> = async (data) => {
        setServerError(null);
        try {
            await axios.put(`http://localhost:3000/api/colors/${id}`, data);
            setSuccessMessage("¡Color actualizado!");
            setTimeout(() => setSuccessMessage(null), 2000);
            navigate("/colors");
        } catch (err) {
            console.error("Error al actualizar el color", err);
            setErrorMessage("Error al actualizar el color. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(null), 2000);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando datos del color...</div>;

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">Editar Color</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
                        {serverError}
                    </div>
                )}
                {errorMessage && (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm font-medium">
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="p-3 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {successMessage}
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium">Nombre del Color</label>
                    <input 
                        {...register("name")}
                        className={`w-full p-2 border rounded mt-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium">Código HEX</label>
                        <input 
                            {...register("hex")}
                            className={`w-full p-2 border rounded mt-1 ${errors.hex ? 'border-red-500' : 'border-gray-300'}`}
                        />
                    </div>
                    <div 
                        className="w-12 h-10 rounded border shadow-sm"
                        style={{ backgroundColor: currentHex?.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? currentHex : "#eee" }}
                    />
                </div>
                {errors.hex && <p className="text-red-500 text-xs mt-1">{errors.hex.message}</p>}

                <div className="flex gap-3 pt-4">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700 disabled:bg-green-300"
                    >
                        {isSubmitting ? "Guardando..." : "GUARDAR CAMBIOS"}
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

export default EditColor;