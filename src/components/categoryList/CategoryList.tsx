import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { Category } from "../../types";

interface CategoryListProps {
    refreshTrigger: number;
}

const CategoryList = ({ refreshTrigger }: CategoryListProps) => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);


    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/categories");
            setCategories(response.data.data); 
        } catch (err) {
            console.error("Error fetching categories:", err);
            setErrorMessage("Error al cargar las categorías. Por favor, intenta nuevamente.");
            setTimeout(() => setErrorMessage(""), 2000);
        } finally {
            setLoading(false);
        }
    };

    // Se ejecuta al montar y cada vez que refreshTrigger cambia (al crear una nueva)
    useEffect(() => {
        fetchCategories();
    }, [refreshTrigger]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            //
            const response = await axios.patch(`http://localhost:3000/api/categories/${id}/${endpoint}`);
            
            if (!response.data.error) {
                setCategories(prev => prev.map(cat => 
                    cat._id === id ? { ...cat, isActive: !isActive } : cat
                ));
            }
            setSuccessMessage(isActive ? "Categoría desactivada correctamente" : "Categoría activada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error toggling product status:", err);
            setErrorMessage("No se puede desactivar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:3000/api/categories/${id}`);
            setCategories(prev => prev.filter(cat => cat._id !== id));
            setSuccessMessage("Categoría eliminada correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
            console.error("Error toggling product status:", err);
            setErrorMessage("No se puede eliminar esta categoría porque está asociada a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center p-10 font-bold">Cargando categorías...</div>;

    return (
        <section className="max-w-5xl mx-auto p-4">
            <div className="mb-6">
                <input 
                    type="text" 
                    placeholder="Filtrar categorías..." 
                    className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
            {successMessage && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map(category => (
                    <div 
                        key={category._id}
                        onClick={() => navigate(`edit-category/${category._id}`)}
                        className="bg-white p-5 rounded-lg shadow border flex flex-col justify-between"
                        style={{ opacity: category.isActive ? 1 : 0.6 }}
                    >
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 uppercase tracking-wide">
                                {category.name}
                            </h3>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                {category.isActive ? "ACTIVA" : "INACTIVA"}
                            </span>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleActive(category._id, category.isActive);
                                }}
                                className={`flex-1 py-2 rounded text-white text-sm font-medium ${category.isActive ? 'bg-orange-400 hover:bg-orange-500' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {category.isActive ? "Pausar" : "Activar"}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowModal(category._id);
                                }}
                                className="flex-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-2 rounded transition-colors text-sm font-medium"
                            >
                                Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <p className="text-center text-gray-500 mt-10">No se encontraron categorías para "{searchTerm}"</p>
            )}
             {showModal && (
    <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <p>¿Estás seguro de eliminar este color?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button 
                    onClick={() => setShowModal(null)} 
                    style={{ backgroundColor: '#ccc', padding: '10px' }}
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => {
                        handleDelete(showModal);
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
    );
};

export default CategoryList;