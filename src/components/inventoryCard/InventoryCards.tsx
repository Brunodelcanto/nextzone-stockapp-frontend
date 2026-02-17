import { useEffect, useState } from "react";
import api from "../../api/axiosConfig";
import type { Category, Product } from "../../types";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Minus, Power, Trash2, AlertTriangle, Ban, PackageSearch } from "lucide-react";

interface InventoryCardsProps {
    refreshTrigger: number;
 }

const InventoryCards = ({ refreshTrigger }: InventoryCardsProps) => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const response = await api.get(`/products`);
            setProducts(response.data.data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProducts();
    }, [refreshTrigger]);

    const filteredProducts = products.filter(product =>{
    const term = searchTerm.toLowerCase();

    const categoryName = typeof product.category === 'object' && product.category !== null
        ? (product.category as Category).name.toLowerCase()
        : '';

    const productName = product.name.toLowerCase();

    return productName.includes(term) || categoryName.includes(term);
   });

    const groupedProducts = filteredProducts.reduce((acc: Record<string, Product[]>, product) => {
    const categoryName = 
        typeof product.category === 'object' && product.category !== null
            ? (product.category as Category).name 
            : 'Sin Categoría';
    
    if (!acc[categoryName]) {
        acc[categoryName] = [];
    }
    acc[categoryName].push(product);
    return acc;
}, {});


   const handleQuantityChange = async (productId: string, color: string, quantity: number) => {
       try {
        const response = await api.patch(`/products/stock/${productId}`, {
            color,
            quantity
        });

        if (!response.data.error) {
            setProducts(prev => prev.map(p => p._id === productId ? response.data.data : p));
        }
       } catch (err) {
        console.error("Error updating stock:", err);
       }
   }

   const handleToggleActive = async (productId: string, isActive: boolean) => {
    try {
        const endpoint = isActive ? "deactivate" : "activate";

        const response = await api.patch(`/products/${endpoint}/${productId}`);

        if (!response.data.error) {
            setProducts(prev => prev.map(p =>
                p._id === productId ? { ...p, isActive: !isActive} : p
            ))
        }
    } catch (err) {
        console.error("Error toggling product status:", err);
        alert("Error to change product status")
    }
   }

   const eliminateProduct = async (productId: string) => {
    try {
        const response = await api.delete(`/products/${productId}`);

        if (!response.data.error) {
            setProducts(prev => prev.filter(p => p._id !== productId));
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product");
    }
   }

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Inventario...</p>
    </div>
);

return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
        
        {/* BUSCADOR ESTILIZADO */}
        <div className="max-w-md mb-12 group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Filtrar por nombre o categoría</label>
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border-2 border-slate-100 rounded-[1.5rem] py-4 pl-14 pr-6 outline-none font-bold text-slate-700 shadow-sm focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                />
            </div>
        </div>

        {/* CONTENEDOR DE CATEGORÍAS */}
        <div className="space-y-16">
            {Object.keys(groupedProducts).map((categoryName) => (
                <div key={categoryName} className="animate-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-1.5 h-8 bg-primary rounded-full" />
                        <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">{categoryName}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {groupedProducts[categoryName].map((product) => {
                            const totalStock = product.variants.reduce((sum, v) => sum + v.amount, 0);
                            const outOfStock = totalStock === 0;
                            const lowStock = totalStock > 0 && totalStock <= 5;

                            const prices = product.variants.map(v => v.priceSell);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

                            return (
                                <div 
                                    key={product._id}
                                    onClick={() => navigate(`/edit-product/${product._id}`)}
                                    className={`relative bg-white p-8 rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-2 group
                                        ${!product.isActive ? 'opacity-50 grayscale' : ''}
                                        ${outOfStock ? 'border-accent-red/20' : lowStock ? 'border-accent-orange/20' : 'border-slate-50'}`}
                                >
                                    {/* BADGES DE ESTADO */}
                                    <div className="absolute top-6 right-6 flex flex-col gap-2 items-end z-10">
                                        {outOfStock && (
                                            <div className="bg-accent-red/10 text-accent-red px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                                                <Ban className="w-3 h-3" /> Agotado
                                            </div>
                                        )}
                                        {lowStock && !outOfStock && (
                                            <div className="bg-accent-orange/10 text-accent-orange px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                                                <AlertTriangle className="w-3 h-3" /> Reponer
                                            </div>
                                        )}
                                    </div>

                                    {/* IMAGEN Y INFO PRINCIPAL */}
                                    <div className="flex gap-6 mb-8">
                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                            {product.image?.url ? (
                                                <img src={product.image.url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                    <PackageSearch className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase leading-tight mb-2 group-hover:text-primary transition-colors italic">{product.name}</h3>
                                            <p className="text-2xl font-black text-accent-green italic tracking-tighter">{priceDisplay}</p>
                                        </div>
                                    </div>

                                    {/* LISTADO DE VARIANTES */}
                                    <div className="space-y-3 mb-8">
                                        {product.variants.map((v, idx) => {
                                            const colorName = typeof v.color === 'object' && v.color !== null ? v.color.name : 'Color...';
                                            const colorId = typeof v.color === 'object' && v.color !== null ? v.color._id : v.color;
                                            
                                            return (
                                                <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl group/item hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{colorName}</span>
                                                        {/* PRECIO ESPECÍFICO POR COLOR */}
                                                        <span className="text-[11px] font-black text-accent-green italic tracking-tighter">${v.priceSell.toLocaleString()}</span>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-xs font-black ${v.amount < 3 ? 'text-accent-red animate-pulse' : 'text-slate-700'}`}>{v.amount} u.</span>
                                                        <div className="flex gap-1">
                                                            <button 
                                                                onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, -1)}}
                                                                disabled={v.amount <= 0 || !product.isActive}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-accent-red hover:shadow-md active:scale-90 transition-all disabled:opacity-30 cursor-pointer"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, 1)}}
                                                                disabled={!product.isActive}
                                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-400 hover:text-primary hover:shadow-md active:scale-90 transition-all disabled:opacity-30 cursor-pointer"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* FOOTER DE CARD CON ACCIONES */}
                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-accent-green animate-pulse' : 'bg-slate-300'}`} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{product.isActive ? 'Activo' : 'Pausado'}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => {e.stopPropagation(); handleToggleActive(product._id, product.isActive)}}
                                                className={`p-3 rounded-xl transition-all shadow-sm active:scale-90 cursor-pointer ${product.isActive ? 'bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white' : 'bg-primary text-white shadow-primary/20'}`}
                                                title={product.isActive ? "Desactivar" : "Activar"}
                                            >
                                                <Power className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={(e) => {e.stopPropagation(); setShowModal(product._id)}}
                                                className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-accent-red hover:text-white transition-all shadow-sm hover:shadow-accent-red/20 active:scale-90 cursor-pointer"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>

        {/* MODAL DE ELIMINACIÓN TIPO NEXTZONE */}
        {showModal && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-slate-100 animate-in zoom-in-95 duration-300">
                    <div className="w-20 h-20 bg-accent-red/10 rounded-full flex items-center justify-center mx-auto mb-6 text-accent-red">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase mb-2">¿Confirmar Baja?</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed mb-8">Esta acción eliminará el producto del inventario de forma permanente.</p>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => { eliminateProduct(showModal); setShowModal(null); }}
                            className="w-full bg-accent-red text-white font-black py-4 rounded-2xl shadow-lg shadow-accent-red/20 hover:bg-red-700 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            Sí, eliminar producto
                        </button>
                        <button 
                            onClick={() => setShowModal(null)}
                            className="w-full bg-slate-100 text-slate-500 font-black py-4 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
                        >
                            No, mantenerlo
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}

export default InventoryCards;