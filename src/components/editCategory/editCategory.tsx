import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";

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
                const response = await axios.get(`http://localhost:3000/api/categories/${id}`);
                reset({ name: response.data.data.name });
                setSuccessMessage("Categoría cargada correctamente");
                setTimeout(() => setSuccessMessage(null), 2000);
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
            await axios.put(`http://localhost:3000/api/categories/${id}`, data);
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

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg mt-10">
            <h2 className="text-2xl font-bold mb-6">Editar Categoría</h2>
            {successMessage && (
                <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">
                    {successMessage}
                </div>
            )}
            {errorMessage && (
                <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">
                    {errorMessage}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nombre</label>
                    <input 
                        {...register("name")}
                        className={`w-full p-2 border rounded mt-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className="flex gap-3">
                    <button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white py-2 rounded font-bold">
                        GUARDAR CAMBIOS
                    </button>
                    <button type="button" onClick={() => navigate("/categories")} className="flex-1 bg-gray-200 py-2 rounded">
                        CANCELAR
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditCategory;