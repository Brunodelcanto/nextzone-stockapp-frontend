import { useEffect, useState } from "react";
import axios from "axios";
import type { Sale } from "../../types";
import { Search, Calendar, DollarSign, TrendingUp, ShoppingBag, Filter } from 'lucide-react';

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
                                    <div className="space-y-2">
                                        {sale.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {item.name} 
                                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px]">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs italic text-slate-400 font-medium max-w-xs truncate">
                                        {sale.comment || "— Sin comentarios —"}
                                    </p>
                                </td>
                                <td className="p-6 text-right">
                                    <span className="text-lg font-black text-slate-800 tracking-tighter italic">
                                        ${sale.totalAmount.toLocaleString()}
                                    </span>
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
    </div>
);
};

export default SalesList;