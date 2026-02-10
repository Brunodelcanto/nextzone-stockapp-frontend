import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import Joi from "joi";
import type { ProductFormValues, Category, Color, ColorVariant } from "../../types/index";

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
                    axios.get(`http://localhost:3000/api/products/${id}`),
                    axios.get("http://localhost:3000/api/categories"),
                    axios.get("http://localhost:3000/api/colors")
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

            console.log("Archivo en FormData:", formData.get("image"));

            await axios.put(`http://localhost:3000/api/products/${id}`, formData);
            setSuccessMessage("¡Producto actualizado!");
            setTimeout(() => setSuccessMessage(""), 2000);
            navigate("/products");
        } catch (err) {
            console.error(err);
            setErrorMessage("Error al actualizar");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando producto...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-4xl mx-auto bg-white shadow rounded-lg">
            <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
            {successMessage && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
            {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                    <label className="block text-sm font-medium">Nombre</label>
                    <input {...register("name")} className="border p-2 w-full rounded" />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium">Categoría</label>
                    <select {...register("category")} className="border p-2 w-full rounded">
                        {categories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Alerta de stock</label>
                    <input type="number" {...register("minStockAlert")} className="border p-2 w-full rounded" />
                    {errors.minStockAlert && <span className="text-red-500 text-xs">{errors.minStockAlert.message}</span>}
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium">Imagen del Producto</label>
                <input 
                type="file" 
                accept="image/*"
                 {...register("image")} 
                 onChange={(e) => {
                 register("image").onChange(e); 
                     const file = e.target.files?.[0];
                    if (file) {
                    setPreview(URL.createObjectURL(file));
                    }
                 }} 
                className="mt-1 block w-full text-sm"
                />
                {preview && (
                    <div className="mt-2 relative inline-block">
                        <img src={preview} alt="Preview" className="w-24 h-24 object-cover rounded border" />
                        <button 
                            type="button" 
                            onClick={() => { setPreview(null); resetField("image"); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                        >✕</button>
                    </div>
                )}
            </div>

            <h3 className="font-bold mb-2">Variantes</h3>
            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2 items-end bg-gray-50 p-2 rounded">
                    <div className="flex-1">
                        <label className="text-xs">Color</label>
                        <select {...register(`variants.${index}.color` as const)} className="border p-1 w-full text-sm">
                            {colors.map(col => <option key={col._id} value={col._id}>{col.name}</option>)}
                        </select>
                    </div>
                    <div className="w-20">
                        <label className="text-xs">Stock</label>
                        <input type="number" {...register(`variants.${index}.amount` as const)} className="border p-1 w-full text-sm" />
                    </div>
                    <div className="w-24">
                        <label className="text-xs">Precio Venta</label>
                        <input type="number" {...register(`variants.${index}.priceSell` as const)} className="border p-1 w-full text-sm" />
                    </div>
                    <div className="w-24">
                        <label className="text-xs">Precio Costo</label>
                        <input type="number" {...register(`variants.${index}.priceCost` as const)} className="border p-1 w-full text-sm" />
                    </div>
                    <button type="button" 
                    onClick={() => remove(index)} 
                    disabled={fields.length === 1}
                    className={`${fields.length === 1 ? 'opacity-30 cursor-not-allowed' : 'text-red-500'}`} >✕</button>
                </div>
            ))}

            <button 
                type="button" 
                onClick={() => append({ color: "", amount: 0, priceCost: 0, priceSell: 0 })}
                className="text-blue-600 text-sm mb-6 block"
            >
                + Agregar Variante
            </button>

            <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-green-600 text-white p-3 rounded font-bold">
                    GUARDAR CAMBIOS
                </button>
                <button 
                    type="button" 
                    onClick={() => navigate("/products")}
                    className="flex-1 bg-gray-200 text-gray-700 p-3 rounded font-bold"
                >
                    CANCELAR
                </button>
            </div>
        </form>
    );
};

export default EditProduct;