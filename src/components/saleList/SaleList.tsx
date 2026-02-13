import { useEffect, useState } from "react";
import axios from "axios";
import type { Sale } from "../../types";
import { Search, Calendar, DollarSign, TrendingUp, ShoppingBag, Filter, X } from 'lucide-react';

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
    const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

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

    if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Cargando reportes de Nextzone...</p>
    </div>
);

return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-500">
        
        {/* HEADER DE MÉTRICAS - DISEÑO PREMIUM */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Card Ventas */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex items-center justify-between transition-all hover:shadow-card-hover hover:-translate-y-1 group">
                <div>
                    <h2 className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Total Ventas</h2>
                    <p className="text-4xl font-black text-slate-800 tracking-tighter">{totals.count}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                    <ShoppingBag className="w-8 h-8" />
                </div>
            </div>

            {/* Card Ingresos */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex items-center justify-between transition-all hover:shadow-card-hover hover:-translate-y-1 group">
                <div>
                    <h2 className="text-[10px] text-accent-green font-black uppercase tracking-[0.2em] mb-1">Ingresos Totales</h2>
                    <p className="text-4xl font-black text-slate-800 tracking-tighter">${totals.revenue.toLocaleString()}</p>
                </div>
                <div className="bg-accent-green/10 p-4 rounded-3xl text-accent-green group-hover:scale-110 transition-transform">
                    <DollarSign className="w-8 h-8" />
                </div>
            </div>

            {/* Card Ganancias */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 flex items-center justify-between transition-all hover:shadow-card-hover hover:-translate-y-1 group">
                <div>
                    <h2 className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">Ganancia Estimada</h2>
                    <p className="text-4xl font-black text-slate-800 tracking-tighter">${totals.profit.toLocaleString()}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-8 h-8" />
                </div>
            </div>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 mb-8 transition-all hover:shadow-card-hover">
            <div className="flex items-center gap-3 mb-6">
                <Filter className="w-5 h-5 text-primary" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest italic">Panel de Filtros</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Búsqueda Rápida</label>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Buscar producto o nota..."
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3 pl-10 pr-4 outline-none font-bold text-slate-600 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Fecha Inicial</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="date"
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3 pl-10 pr-4 outline-none font-bold text-slate-600 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest group-focus-within:text-primary transition-colors">Fecha Final</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="date"
                            className="w-full bg-slate-50 border-2 border-transparent rounded-2xl py-3 pl-10 pr-4 outline-none font-bold text-slate-600 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* TABLA DE VENTAS */}
        <div className="bg-white rounded-[2.5rem] shadow-card border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Fecha</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Artículos Vendidos</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Notas</th>
                            <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Monto Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
    {filteredSales.map((sale) => (
        <tr key={sale._id} className="group hover:bg-slate-50 transition-all duration-300">
            <td className="p-6">
                <span className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-black text-slate-600 uppercase tracking-tighter">
                    {new Date(sale.createdAt).toLocaleDateString()}
                </span>
            </td>
            <td className="p-6">
                <div className="space-y-3">
                    {sale.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                            {/* Nombre del producto y cantidad */}
                            <div className="flex items-center gap-2 text-xs font-black text-slate-700 uppercase tracking-tight">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {item.name}
                                <span className="bg-primary text-white px-2 py-0.5 rounded text-[9px]">x{item.quantity}</span>
                            </div>
                            {/* PRECIO INDIVIDUAL POR ARTÍCULO */}
                            <div className="ml-3.5 flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Unitario: <span className="text-slate-600">${item.priceAtSale.toLocaleString()}</span>
                                </span>
                                <span className="text-slate-200">|</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Subtotal: <span className="text-slate-600">${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </td>
            <td className="p-6">
    {sale.comment ? (
        <div className="flex items-center gap-2">
            <p className="text-xs italic text-slate-400 font-medium max-w-[150px] truncate">
                {sale.comment}
            </p>
            <button 
                onClick={() => setSelectedSale(sale)}
                className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer group/note"
            >
                <Filter className="w-3 h-3 rotate-180 group-hover/note:scale-110" />
            </button>
        </div>
    ) : (
        <span className="text-xs text-slate-300 italic font-medium">— Sin notas —</span>
    )}
</td>
            <td className="p-6 text-right">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Monto Final</span>
                    <span className="text-xl font-black text-slate-800 tracking-tighter italic">
                        ${sale.totalAmount.toLocaleString()}
                    </span>
                </div>
            </td>
        </tr>
    ))}
</tbody>
                </table>
            </div>
            
            {filteredSales.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                    <Search className="w-12 h-12 text-slate-100" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">No se encontraron registros en Next Zone</p>
                </div>
            )}
        </div>
        {/* MODAL DE DETALLE DE VENTA */}
{selectedSale && (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 animate-in fade-in duration-300">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full border border-slate-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            {/* Decoración superior */}
            <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
            
            <button 
                onClick={() => setSelectedSale(null)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-8">
                <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                    <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase italic">Detalle de Venta</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 italic">Comentario de la Operación</h4>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed whitespace-pre-wrap italic">
                        "{selectedSale.comment}"
                    </p>
                </div>

                <div className="px-2">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Resumen de Artículos</h4>
                    <div className="space-y-3">
                        {selectedSale.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-600">
                                <span>{item.name} <span className="text-primary tracking-tighter italic">x{item.quantity}</span></span>
                                <span className="font-black text-slate-800">${(item.priceAtSale * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Cobrado</span>
                    <span className="text-3xl font-black text-accent-green tracking-tighter italic">${selectedSale.totalAmount.toLocaleString()}</span>
                </div>

                <button 
                    onClick={() => setSelectedSale(null)}
                    className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer uppercase tracking-widest text-xs mt-4"
                >
                    Cerrar Detalle
                </button>
            </div>
        </div>
    </div>
)}
    </div>
);


};

export default SalesList;