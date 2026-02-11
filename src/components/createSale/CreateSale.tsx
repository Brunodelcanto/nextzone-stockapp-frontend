import { useState, useEffect } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import type { Product, Color, CartItem, ColorVariant } from "../../types";
import { ShoppingCart, Package, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 bg-slate-50 min-h-[calc(100vh-80px)] selection:bg-primary/30">
        
        {/* SECCIÓN IZQUIERDA: CATÁLOGO DE PRODUCTOS */}
        <div className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex flex-col transition-all hover:shadow-card-hover">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                        <Package className="w-6 h-6" /> {/* ICONO DE PAQUETE */}
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase leading-none">Productos</h2>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Catálogo disponible</p>
                    </div>
                </div>
                <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-primary font-black text-xs uppercase italic">{products.length} Items</span>
                </div>
            </div>

            {/* MENSAJES DE ESTADO */}
            <div className="space-y-4">
                {errorMessage && (
                    <div className="p-4 bg-accent-red/[0.08] border border-accent-red/20 text-accent-red text-xs font-black rounded-2xl animate-pulse uppercase tracking-wide flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" /> {/* ICONO DE ERROR */}
                        {errorMessage}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-accent-green/[0.08] border border-accent-green/20 text-accent-green text-xs font-black rounded-2xl animate-bounce uppercase tracking-wide flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" /> {/* ICONO DE ÉXITO */}
                        {successMessage}
                    </div>
                )}
            </div>

            {/* LISTADO DE PRODUCTOS */}
            <div className="mt-4 space-y-4 overflow-y-auto pr-2 max-h-[65vh] scrollbar-thin scrollbar-thumb-slate-200">
                {products.map(product => (
                    <div key={product._id} className="p-5 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                        <p className="font-black text-slate-700 uppercase tracking-tight text-lg group-hover:text-primary transition-colors italic">
                            {product.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {product.variants.map(v => (
                                <button
                                    key={v._id}
                                    onClick={() => addToCart(product, v)}
                                    disabled={v.amount <= 0}
                                    className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2
                                        ${v.amount <= 0 
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                            : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-primary hover:text-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95 shadow-sm'
                                        }`}
                                >
                                    <span>{(v.color as Color)?.name}</span>
                                    <span className={`px-2 py-0.5 rounded-md ${v.amount < 5 ? 'bg-accent-red/10 text-accent-red animate-pulse' : 'bg-primary/10 text-primary'}`}>
                                        {v.amount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECCIÓN DERECHA: RESUMEN DE VENTA */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col h-full border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full" />
                
                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <ShoppingCart className="w-6 h-6 text-primary-light" /> {/* ICONO DE CARRITO */}
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">Resumen</h2>
                </div>
                
                {/* CARRITO */}
                <div className="flex-1 space-y-4 overflow-y-auto pr-2 max-h-[40vh] relative z-10">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 italic py-10">
                            <ShoppingCart className="w-12 h-12 mb-4 opacity-20" />
                            <p className="font-black text-sm uppercase tracking-[0.3em]">Carrito Vacío</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.variantId} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                    <p className="font-black text-xs uppercase tracking-wide">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Cantidad: {item.quantity}</p>
                                </div>
                                <span className="font-black text-primary-light italic text-lg">${item.price * item.quantity}</span>
                            </div>
                        ))
                    )}
                </div>
                
                {/* TOTAL Y CONFIRMACIÓN */}
                <div className="mt-8 border-t border-white/10 pt-8 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Total a cobrar</span>
                        <p className="text-5xl font-black text-primary tracking-tighter italic">${total}</p>
                    </div>

                    <textarea 
                        placeholder="NOTAS DE LA VENTA (OPCIONAL)..."
                        className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-4 text-sm font-bold placeholder:text-slate-600 outline-none focus:border-primary/50 transition-all text-white uppercase tracking-wider"
                        rows={2}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />

                    <button 
                        onClick={handleConfirmSale}
                        disabled={cart.length === 0}
                        className="group relative w-full overflow-hidden bg-primary text-white font-black py-5 rounded-2xl shadow-2xl shadow-primary/40 transition-all duration-300 hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed mt-6 uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3"
                    >
                        <span className="relative z-10">Confirmar Venta</span>
                        <ShoppingCart className="relative z-10 w-5 h-5" />
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    </button>
                </div>
            </div>
        </div>
    </div>
);
};

export default CreateSale;