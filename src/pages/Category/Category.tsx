import { useState } from "react";
import CategoryList from "../../components/categoryList/CategoryList";
import CreateCategory from "../../components/createCategory/CreateCategory";

const CategoryPage = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold text-center mb-6">Gestión de Categorías</h1>
            <CreateCategory onCategoryCreated={() => setRefreshTrigger(prev => prev + 1)} />
            <hr className="my-10" />
            <CategoryList refreshTrigger={refreshTrigger} />
        </div>
    );
};

export default CategoryPage;