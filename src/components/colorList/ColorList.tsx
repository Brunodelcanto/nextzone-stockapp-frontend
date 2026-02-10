import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { Color } from "../../types";

interface ColorListProps {
    refreshTrigger: number
}

const ColorList = ({ refreshTrigger }: ColorListProps) => {
    const navigate = useNavigate();
    const [colors, setColors] = useState<Color[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const fetchColors = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/colors");
            setColors(response.data.data);
        } catch (err) {
            console.error("Error fetching colors:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColors();
    }, [refreshTrigger]);

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            const endpoint = isActive ? "deactivate" : "activate";
            await axios.patch(`http://localhost:3000/api/colors/${id}/${endpoint}`);
            setColors(prev => prev.map(c => c._id === id ? { ...c, isActive: !isActive } : c));
            setSuccessMessage(isActive ? "Color desactivado correctamente" : "Color activado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
             console.error("Error toggling product status:", err);
            setErrorMessage("No se puede desactivar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`http://localhost:3000/api/colors/${id}`);
            setColors(prev => prev.filter(c => c._id !== id));
            setSuccessMessage("Color eliminado correctamente");
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (err) {
             console.error("Error toggling product status:", err);
            setErrorMessage("No se puede eliminar este color porque está asociado a un producto");
            setTimeout(() => setErrorMessage(""), 2000);
        }
    };

    const filteredColors = colors.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-10 text-center text-xl font-bold">Cargando colores de Nextzone...</div>;

    return (
        <section className="p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gestión de Colores</h1>
            </div>
            {errorMessage && <div className="mb-4 p-2 bg-red-200 text-red-800 rounded">{errorMessage}</div>}
            {successMessage && <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{successMessage}</div>}
            <input 
                type="text" 
                placeholder="Buscar color..." 
                className="w-full p-2 mb-6 border rounded shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredColors.map(color => (
                    <div 
                        key={color._id}
                        onClick={() => navigate(`/edit-color/${color._id}`)}
                        className="p-4 bg-white rounded-lg shadow border flex flex-col items-center"
                        style={{ opacity: color.isActive ? 1 : 0.6 }}
                    >
                        {/* Círculo de previsualización del color */}
                        <div 
                            className="w-16 h-16 rounded-full border-2 mb-3 shadow-inner"
                            style={{ backgroundColor: color.hex }}
                        />
                        
                        <h3 className="font-bold text-lg mb-1 uppercase">{color.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{color.hex}</p>

                        <div className="flex gap-2 w-full mt-auto">
                            <button 
                                onClick={(e) => {e.stopPropagation(); handleToggleActive(color._id, color.isActive || false)}}
                                className={`flex-1 text-sm py-1 rounded text-white ${color.isActive ? 'bg-orange-500' : 'bg-green-500'}`}
                            >
                                {color.isActive ? "Desactivar" : "Activar"}
                            </button>
                            <button 
                                onClick={(e) => {e.stopPropagation(); setShowModal(color._id)}}
                                className="flex-1 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white text-sm py-1 rounded transition-colors"
                            >
                                Borrar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
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

export default ColorList;