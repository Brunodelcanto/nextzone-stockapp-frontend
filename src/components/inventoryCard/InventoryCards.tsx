import { useEffect, useState } from "react";
import axios from "axios";
import type { Category, Product } from "../../types";

const InventoryCards = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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
    }, []);

    const groupedProducts = products.reduce((acc: Record<string, Product[]>, product) => {
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

    const handleIncreaseStock = async (productId: string, color: string) => {
        // Aquí irá la lógica para sumar +1 a la variante específica en el back
        console.log(`Aumentando stock de: ${productId} - Color: ${color}`);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <section>
            {Object.keys(groupedProducts).map((categoryName)=> (
                <div key={categoryName}>
                    <h2>{categoryName}</h2>
                    <div>
                        {groupedProducts[categoryName].map((product: Product) => (
                            <div key={product._id}>
                                <h3>{product.name}</h3>
                               {product.image?.url && (
                                    <img src={product.image.url} alt={product.name} />
                                )}
                                <ul>
                                    {product.variants.map((v, idx) => (
                                        <li key={idx}>
                                            {v.color}: {v.amount} unidades
                                            <button 
                                                onClick={() => handleIncreaseStock(product._id as string, v.color)}
                                                disabled={!product.isActive}
                                            >
                                                +
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                
                                <p>
                                    Total Stock: {product.variants.reduce((sum, v) => sum + v.amount, 0)}
                                </p>
                                <div>
                                    <button>{product.isActive ? "Desactivar" : "Activar"}</button>
                                    <button>Editar</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </section>
    )

}

export default InventoryCards;