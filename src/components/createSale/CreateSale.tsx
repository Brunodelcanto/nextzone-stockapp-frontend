import { useState, useEffect } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import type { Product, Color, CartItem, ColorVariant } from "../../types";

interface CreateSaleProps {
    onSaleCreated: () => void;
}


const CreateSale = ({ onSaleCreated }: CreateSaleProps) => {
    // const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [comment, setComment] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await axios.get("http://localhost:3000/api/products");
            setProducts(res.data.data.filter((p: Product) => p.isActive));
        };
        fetchProducts();
    }, []);

    const reset = () => {
        setCart([]);
        setComment("");
    };

    const addToCart = (product: Product, variant: ColorVariant) => {
        const existing = cart.find(item => item.variantId === variant._id);
        
        if (existing) {
            if (existing.quantity >= variant.amount) {
                setErrorMessage("Sin stock suficiente");
                return;
            }
            setCart(cart.map(item => 
                item.variantId === variant._id 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            setCart([...cart, {
                productId: product._id,
                variantId: variant._id!,
                name: `${product.name} (${(variant.color as Color)?.name})`,
                quantity: 1,
                price: variant.priceSell,
                maxStock: variant.amount
            }]);
            setSuccessMessage("Producto agregado al carrito");
            setTimeout(() => setSuccessMessage(""), 1000);
        }
    };

    const handleConfirmSale = async () => {
        if (cart.length === 0) return;
        try {
            const saleData = {
                items: cart.map(item => ({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: item.quantity
                })),
                comment
            };
            const token = localStorage.getItem("token");  
            await axios.post("http://localhost:3000/api/sales", saleData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccessMessage("Venta realizada con éxito");
            setTimeout(() => setSuccessMessage(""), 2000);
            reset();
            onSaleCreated();
        } catch (err) {
            console.error("Error creating sale:", err);
            setErrorMessage("Error al realizar la venta");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-white p-4 shadow rounded">
                <h2 className="text-xl font-bold mb-4">Productos</h2>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
                    {successMessage && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
                    {products.map(product => (
                        <div key={product._id} className="border-b pb-2">
                            <p className="font-bold">{product.name}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {product.variants.map(v => (
                                    <button
                                        key={v._id}
                                        onClick={() => addToCart(product, v)}
                                        disabled={v.amount <= 0}
                                        className="text-xs bg-blue-100 p-1 rounded hover:bg-blue-200 disabled:bg-gray-200"
                                    >
                                        {(v.color as Color)?.name} ({v.amount})
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gray-50 p-4 shadow rounded flex flex-col">
                <h2 className="text-xl font-bold mb-4">Resumen de Venta</h2>
                <div className="flex-1 space-y-2">
                    {cart.map(item => (
                        <div key={item.variantId} className="flex justify-between border-b py-1">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${item.price * item.quantity}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 border-t pt-4">
                    <p className="text-2xl font-bold text-right">Total: ${total}</p>
                    <textarea 
                        placeholder="Comentario (opcional)..."
                        className="w-full mt-2 p-2 border rounded"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <button 
                        onClick={handleConfirmSale}
                        className="w-full bg-green-600 text-white font-bold py-3 rounded mt-4 hover:bg-green-700"
                    >
                        CONFIRMAR VENTA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSale;