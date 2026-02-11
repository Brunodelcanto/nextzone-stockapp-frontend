import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Palette, Tags, Receipt, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login");
  };

 const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
      isActive 
        ? "bg-primary text-white shadow-lg shadow-primary/30 -translate-y-0.5" 
        : "text-slate-400 hover:text-primary hover:bg-primary/5"
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 shadow-card sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO / NOMBRE - Identidad Nextzone */}
          <div className="flex items-center gap-12">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => navigate("/dashboard")}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                N
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter italic group-hover:text-primary transition-colors">
                NEXTZONE
              </h1>
            </div>
            
            {/* LINKS DE NAVEGACIÓN - Con iconos Lucide */}
            <div className="hidden lg:flex items-center space-x-2">
              <NavLink to="/dashboard" className={linkClass}>
                <LayoutDashboard className="w-4 h-4" /> Inicio
              </NavLink>
              <NavLink to="/products" className={linkClass}>
                <Package className="w-4 h-4" /> Productos
              </NavLink>
              <NavLink to="/colors" className={linkClass}>
                <Palette className="w-4 h-4" /> Colores
              </NavLink>
              <NavLink to="/categories" className={linkClass}>
                <Tags className="w-4 h-4" /> Categorías
              </NavLink>
              <NavLink to="/sales" className={linkClass}>
                <Receipt className="w-4 h-4" /> Ventas
              </NavLink>
            </div>
          </div>

          {/* BOTÓN DE LOGOUT - Usando accent-red */}
          <div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-50 hover:bg-accent-red hover:text-white text-slate-500 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-accent-red/30 active:scale-95 cursor-pointer group"
            >
              <span className="group-hover:translate-x-[-2px] transition-transform">Cerrar Sesión</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;