import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import type {SubmitHandler } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi"; 
import type { Category, Color, ColorVariant } from "../../types/index";
import Joi from "joi";

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

    const { register, control, handleSubmit, reset, resetField, formState: { errors } } = useForm<ProductFormValues>({
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
                    axios.get("http://localhost:3000/api/categories"),
                    axios.get("http://localhost:3000/api/colors")
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
        console.log("Errores de validación actual:", errors);
    }
}, [errors]);

    const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("category", data.category);
            formData.append("minStockAlert", data.minStockAlert.toString());
            formData.append("variants", JSON.stringify(data.variants));

            if (data.image && data.image[0]) {
                formData.append("image", data.image[0]);
            }

            await axios.post("http://localhost:3000/api/products", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setSuccessMessage("¡Producto cargado con éxito!");
            setTimeout(() => setSuccessMessage(""), 2000);
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

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-white shadow rounded-lg">

            {successMessage && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
            {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}

            <div className="mb-4">
                <label>Nombre</label>
                <input {...register("name")} className="border p-2 w-full" />
                {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            <div className="mb-4">
                <label>Categoría</label>
                <select {...register("category")} className="border p-2 w-full">
                    <option value="">Seleccionar categoría...</option>
                    {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                </select>
                {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
            </div>

            <div className="mb-4">
                <label>Imagen</label>
                <input type="file" {...register("image")} accept="image/*" onChange={(e) => {register("image").onChange(e); handleImageChange(e)}} />
                {errors.image && <span className="text-red-500 text-xs">{errors.image.message}</span>}
            </div>
            

            {preview && (
        <div className="mt-4 flex flex-col items-start">
            <div className="relative">
                <img 
                    src={preview} 
                    alt="Vista previa" 
                    className="w-32 h-32 object-cover rounded-lg border shadow-sm"
                />
                {/* Botón flotante para limpiar */}
                <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-700 shadow-lg"
                    title="Eliminar imagen seleccionada"
                >
                    ✕
                </button>
            </div>
        </div>
    )}

            
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-4 mb-3 items-end bg-gray-50 p-3 rounded">
                    <div className="flex-1">
                        <label className="text-xs">Color</label>
                        <select 
                            {...register(`variants.${index}.color` as const)}
                            className="border p-2 w-full rounded"
                        >
                            <option value="">Seleccionar color...</option>
                            {colors.map(c => (
                                <option key={c._id} value={c._id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-20">
                        <label className="text-xs">Stock</label>
                        <input type="number" {...register(`variants.${index}.amount` as const)} className="border p-1 w-full" />
                        {errors.variants?.[index]?.amount && <span className="text-red-500 text-xs">{errors.variants[index]?.amount?.message}</span>}
                    </div>

                    <div className="w-24">
                        <label className="text-xs">Precio Costo</label>
                        <input type="number" step="0.01" {...register(`variants.${index}.priceCost` as const)} className="border p-1 w-full" />
                        {errors.variants?.[index]?.priceCost && <span className="text-red-500 text-xs">{errors.variants[index]?.priceCost?.message}</span>}
                    </div>
                    <div className="w-24">
                        <label className="text-xs">Precio Venta</label>
                        <input type="number" step="0.01" {...register(`variants.${index}.priceSell` as const)} className="border p-1 w-full" />
                        {errors.variants?.[index]?.priceSell && <span className="text-red-500 text-xs">{errors.variants[index]?.priceSell?.message}</span>}
                    </div>
                    
                    <button 
                    type="button" 
                    onClick={() => remove(index)} 
                    disabled={fields.length === 1}
                    className={`${fields.length === 1 ? 'opacity-30 cursor-not-allowed' : 'text-red-500'}`}
                    >
            X
        </button>
                </div>
            ))}

            <button 
                type="button" 
                onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0 })}
                className="text-blue-500 text-sm mb-4"
            >
                + Agregar Color
            </button>

            <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded">
                {loading ? "Guardando..." : "CREAR PRODUCTO"}
            </button>
        </form>
    );
};

export default CreateProduct;