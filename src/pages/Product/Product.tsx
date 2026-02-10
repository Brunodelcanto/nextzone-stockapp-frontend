import { useState } from "react";
import CreateProduct from "../../components/createProduct/CreateProduct";
import InventoryCards from "../../components/inventoryCard/InventoryCards";

const ProductList = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    return (
        <div>
            <h1>Product List</h1>
            <CreateProduct onProductCreated={() => setRefreshTrigger(prev => prev+1)} />
            <InventoryCards refreshTrigger={refreshTrigger} />
        </div>
    )
}

export default ProductList;