import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, Package, AlertTriangle, DollarSign, 
  ArrowRight, ShoppingCart, LayoutDashboard, Clock 
} from "lucide-react";
import type { Sale, Product } from "../../types";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    recentSales: [] as Sale[],
    totalRevenue: 0,
    totalProfit: 0,
    totalSalesCount: 0,
    lowStockCount: 0,
    totalProducts: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [resSales, resProducts] = await Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/sales`, { 
        withCredentials: true 
      }),
      axios.get(`${import.meta.env.VITE_API_URL}/products`, {
        withCredentials: true
      })
    ]);

        const sales = resSales.data.data;
        const products = resProducts.data.data;

        const lowStock = products.filter((p: Product) => 
          p.isActive && p.variants.reduce((acc, v) => acc + v.amount, 0) <= 5
        ).length;

        setData({
          recentSales: sales.slice(0, 5),
          totalRevenue: resSales.data.totalRevenue || 0,
          totalProfit: resSales.data.totalProfit || 0,
          totalSalesCount: resSales.data.count || 0,
          lowStockCount: lowStock,
          totalProducts: products.length
        });
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-slate-400 font-black uppercase tracking-widest text-xs animate-pulse">Sincronizando Nextzone...</p>
    </div>
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/20">
            <LayoutDashboard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic leading-none">Panel de Control</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Métricas de Rendimiento</p>
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Última actualización: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </header>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 group hover:shadow-card-hover transition-all">
          <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:rotate-12 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ventas Totales</h3>
          <p className="text-3xl font-black text-slate-800 tracking-tighter italic">${data.totalRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 group hover:shadow-card-hover transition-all">
          <div className="bg-accent-green/10 w-12 h-12 rounded-2xl flex items-center justify-center text-accent-green mb-6 group-hover:rotate-12 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ganancia Est.</h3>
          <p className="text-3xl font-black text-slate-800 tracking-tighter italic">${data.totalProfit.toLocaleString()}</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-card border border-slate-100 group hover:shadow-card-hover transition-all">
          <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-500 mb-6 group-hover:rotate-12 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Productos</h3>
          <p className="text-3xl font-black text-slate-800 tracking-tighter italic">{data.totalProducts}</p>
        </div>

        <div className={`p-8 rounded-[2.5rem] shadow-card border transition-all group hover:shadow-card-hover ${data.lowStockCount > 0 ? 'bg-accent-red/[0.03] border-accent-red/20 animate-pulse' : 'bg-white border-slate-100'}`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${data.lowStockCount > 0 ? 'bg-accent-red text-white' : 'bg-slate-100 text-slate-300'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-inherit">Stock Crítico</h3>
          <p className={`text-3xl font-black tracking-tighter italic ${data.lowStockCount > 0 ? 'text-accent-red' : 'text-slate-800'}`}>{data.lowStockCount} Items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ÚLTIMAS VENTAS */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-card border border-slate-100">
          <div className="flex items-center justify-between mb-8 px-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-primary" /> Recientes
            </h3>
            <button onClick={() => navigate('/sales')} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-1 cursor-pointer">
              Ver Historial <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {data.recentSales.map(sale => (
              <div key={sale._id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-slate-100 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[10px] font-black text-slate-400 uppercase italic">
                    {new Date(sale.createdAt).toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'})}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Venta #{sale._id.slice(-4)}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{sale.items.length} productos registrados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 italic text-lg">${sale.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div className="lg:col-span-4 space-y-6">
          <div 
            onClick={() => navigate('/sales')}
            className="group relative bg-primary p-10 rounded-[3rem] shadow-xl shadow-primary/30 text-white overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
            <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Nueva Venta</h3>
            <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">Terminal de cobro</p>
            <ShoppingCart className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity rotate-12" />
          </div>

          <div 
            onClick={() => navigate('/products')}
            className="group bg-slate-900 p-10 rounded-[3rem] shadow-xl text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-800"
          >
            <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Inventario</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Carga y Stock</p>
            <Package className="mt-6 text-primary w-8 h-8 group-hover:translate-x-2 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;