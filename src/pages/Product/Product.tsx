import CreateProduct from "../../components/createProduct/CreateProduct";
import InventoryCards from "../../components/inventoryCard/InventoryCards";

const ProductList = () => {
    
    return (
        <div>
            <h1>Product List</h1>
            <CreateProduct />
            <InventoryCards />
        </div>
    )
}

export default ProductList;