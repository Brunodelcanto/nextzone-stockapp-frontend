import { useEffect, useState } from "react";
import axios from "axios";
import type { Sale } from "../../types";

interface SalesListProps {
    refreshTrigger: number;
}

const SalesList = ({ refreshTrigger }: SalesListProps) => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [totals, setTotals] = useState({ count: 0, revenue: 0, profit: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const fetchSales = async () => {
        const token = localStorage.getItem("token");
        try {
            setLoading(true);
            let url = `http://localhost:3000/api/sales?t=${Date.now()}`;
            if (startDate && endDate) {
                url += `&startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSales(res.data.data);
            setTotals({ 
                count: res.data.count, 
                revenue: res.data.totalRevenue, 
                profit: res.data.totalProfit 
            });
        } catch (err) {
            console.error("Error al traer ventas:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [refreshTrigger, startDate, endDate]);

    const filteredSales = sales.filter((sale) => {
        const term = searchTerm.toLowerCase();
        const matchesComment = sale.comment?.toLowerCase().includes(term);
        const matchesProduct = sale.items.some((item) =>
            item.name.toLowerCase().includes(term)
        );
        return matchesComment || matchesProduct;
    });

    if (loading) return <div className="text-center p-10 font-bold">Cargando reportes de Nextzone...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6 bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
                <div>
                    <h2 className="text-xs text-blue-600 font-bold uppercase tracking-wider">Total Ventas</h2>
                    <p className="text-3xl font-black">{totals.count}</p>
                </div>
                <div className="text-right border-l border-blue-200 pl-6">
                    <h2 className="text-xs text-green-600 font-bold uppercase tracking-wider">Ingresos Totales</h2>
                    <p className="text-3xl font-black text-green-700">${totals.revenue.toLocaleString()}</p>
                </div>
                <div className="text-right border-l border-blue-200 pl-6">
                    <h2 className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Ganancia Estimada</h2>
                    <p className="text-3xl font-black text-indigo-700">${totals.profit.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Buscar Producto o Comentario</label>
                    <input 
                        type="text"
                        placeholder="Ej: Funda iPhone..."
                        className="p-2 border rounded focus:ring-2 focus:ring-blue-400 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Desde</label>
                    <input 
                        type="date"
                        className="p-2 border rounded"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1">Hasta</label>
                    <input 
                        type="date"
                        className="p-2 border rounded"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-100">
                <table className="w-full text-left bg-white">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="p-4 text-sm font-semibold uppercase">Fecha</th>
                            <th className="p-4 text-sm font-semibold uppercase">Productos</th>
                            <th className="p-4 text-sm font-semibold uppercase">Comentario</th>
                            <th className="p-4 text-right text-sm font-semibold uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredSales.map((sale) => (
                            <tr key={sale._id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-4 text-sm text-gray-600">
                                    {new Date(sale.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    {sale.items.map((item, idx) => (
                                        <div key={idx} className="text-xs text-gray-700 font-medium">
                                            • {item.name} <span className="text-gray-400 font-normal">(x{item.quantity})</span>
                                        </div>
                                    ))}
                                </td>
                                <td className="p-4 text-sm italic text-gray-500">
                                    {sale.comment || "—"}
                                </td>
                                <td className="p-4 text-right font-bold text-gray-900">
                                    ${sale.totalAmount.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                                    No se encontraron ventas con los filtros aplicados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesList;