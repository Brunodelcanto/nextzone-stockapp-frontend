import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";

interface CategoryFormValues {
    name: string;
}

interface CreateCategoryProps {
    onCategoryCreated: () => void;
}

const categorySchema = Joi.object<CategoryFormValues>({
    name: Joi.string().min(3).required().messages({
        "string.empty": "El nombre es obligatorio",
        "string.min": "Debe tener al menos 3 caracteres"
    })
});

const CreateCategory = ({ onCategoryCreated }: CreateCategoryProps) => {
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm<CategoryFormValues>({
        resolver: joiResolver(categorySchema)
    });

    const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
        try {
            const response = await axios.post("http://localhost:3000/api/categories", data);
            if (!response.data.error) {
                setSuccessMessage("Categoría creada correctamente");
                setTimeout(() => setSuccessMessage(""), 2000);
                reset();
                onCategoryCreated();
            }
        } catch (err) {
            console.error("Error creating category:", err);
            setErrorMessage("Error al crear la categoría. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nueva Categoría</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {errorMessage && <div className="p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
                {successMessage && <div className="p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
                
                <div>
                    <label className="block text-sm font-medium">Nombre</label>
                    <input 
                        {...register("name")}
                        placeholder="Ej: Fundas iPhone"
                        className={`w-full p-2 border rounded mt-1 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isSubmitting ? "Guardando..." : "CREAR CATEGORÍA"}
                </button>
            </form>
        </div>
    );
};

export default CreateCategory;