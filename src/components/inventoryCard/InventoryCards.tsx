import { useEffect, useState } from "react";
import axios from "axios";
import type { Category, Product } from "../../types";
import { useNavigate } from "react-router-dom";

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
            const response = await axios.get("http://localhost:3000/api/products");
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
    const url = `http://localhost:3000/api/products/stock/${productId}`;
    console.log("Enviando a:", url, "Datos:", { color, quantity });
       try {
        const response = await axios.patch(`http://localhost:3000/api/products/stock/${productId}`, {
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

        const response = await axios.patch(`http://localhost:3000/api/products/${endpoint}/${productId}`);

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
        const response = await axios.delete(`http://localhost:3000/api/products/${productId}`);

        if (!response.data.error) {
            setProducts(prev => prev.filter(p => p._id !== productId));
        }
    } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product");
    }
   }

    if (loading) return <div>Loading...</div>;

    return (
        <section>
            <div>
            <input 
                type="text" 
                placeholder="Buscar producto por nombre..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
            {Object.keys(groupedProducts).map((categoryName)=>(
                <div key={categoryName}>
                    <h2>{categoryName}</h2>
                    <div>
                        {groupedProducts[categoryName].map((product: Product) =>{

                            const totalStock = product.variants.reduce((sum, v) => sum + v.amount, 0);

                            const outOfStock = totalStock === 0;
                            const lowStock = totalStock > 0 && totalStock <= 5;

                            const prices = product.variants.map(v => v.priceSell);
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);
                            const priceDisplay = minPrice === maxPrice ? `$${minPrice}` : `$${minPrice} - $${maxPrice}`;

                            return (
                            <div key={product._id}
                            onClick={() => navigate(`/edit-product/${product._id}`)}
                            style ={{
                                    border: outOfStock ? '2px solid #ff4d4f' : lowStock ? '2px solid #faad14' : '1px solid #d9d9d9',
                                    backgroundColor: outOfStock ? '#fff2f0' : lowStock ? '#fffbe6' : '#fff',
                                     padding: '15px',
                                     borderRadius: '8px',
                                    marginBottom: '10px',
                                     opacity: product.isActive ? 1 : 0.6
                                 }}
                            >
                                <div style={{float: 'right'}}>
                                    {outOfStock && <b style={{ color: '#cf1322' }}>🚫 AGOTADO</b>}
                                    {lowStock && <b style={{ color: '#d46b08' }}>⚠️ REPONER</b>}
                                </div>
                                <h3>{product.name}</h3>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2ecc71' }}>
                                {priceDisplay}
                                </p>
                               {product.image?.url && (
                                    <img src={product.image.url} alt={product.name} />
                                )}
                                <ul>
                                    {product.variants.map((v, idx) => {
                                        const colorName = typeof v.color === 'object' && v.color !== null  ? v.color.name : 'Color no cargado';
                                        const colorId = typeof v.color === 'object' && v.color !== null ? v.color._id : v.color;
                                        return (
                                        <li key={idx}>
                                        {colorName}: {v.amount} unidades
                                        <button 
                                            onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, 1)}}
                                            disabled={!product.isActive}
                                        >
                                            +
                                        </button>
                        
                                        <button 
                                            onClick={(e) => {e.stopPropagation(); handleQuantityChange(product._id, colorId, -1)}}
                                            disabled={v.amount <= 0 || !product.isActive}
                                        >
                                           -
                                        </button>
                                    </li>
                                        )
                                    })}
                                </ul>
                                
                                <p>
                                    Total Stock: {totalStock}
                                </p>

                                <div>
                                    <button
                                    onClick={(e) => {e.stopPropagation(); handleToggleActive(product._id, product.isActive)}}
                                    >{product.isActive ? "Desactivar" : "Activar"}</button>
                                </div>
                                <div>
                                    <button onClick={(e) => {e.stopPropagation(); setShowModal(product._id)}}>Eliminar</button>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            ))}
            {showModal && (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p>¿Estás seguro de eliminar este producto?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                    onClick={() => setShowModal(null)} 
                    style={{ backgroundColor: '#ccc', padding: '10px' }}
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => {
                        eliminateProduct(showModal);
                        setShowModal(null);
                    }} 
                    style={{ backgroundColor: '#ff4d4f', color: 'white', padding: '10px' }}
                >
                    Sí, eliminar
                </button>
            </div>
        </div>
    </div>
)}
        </section>
    )

}

export default InventoryCards;