import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Package, Palette, Tags, 
  Receipt, LogOut, Menu, X 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false); 

  const handleLogout = async () => {
    await logout(); 
    setIsOpen(false); 
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-6 py-4 lg:px-4 lg:py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
      isActive 
        ? "bg-primary text-white shadow-lg shadow-primary/30 lg:-translate-y-0.5" 
        : "text-slate-400 hover:text-primary hover:bg-primary/5"
    }`;

  return (
    <nav className="bg-white border-b border-slate-100 shadow-card sticky top-0 z-[100]">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* LOGO */}
          <div className="flex items-center gap-12">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => { navigate("/dashboard"); setIsOpen(false); }}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                N
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tighter italic group-hover:text-primary transition-colors">
                NEXTZONE
              </h1>
            </div>
            
            {/* LINKS DESKTOP */}
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

          {/* BOTONES DERECHA (Logout en Desktop / Menu en Mobile) */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-slate-50 hover:bg-accent-red hover:text-white text-slate-500 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-accent-red/30 active:scale-95 cursor-pointer group"
              >
                <span>Cerrar Sesión</span>
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* BOTÓN HAMBURGUESA (Solo Mobile) */}
            <button 
              onClick={toggleMenu}
              className="lg:hidden p-3 rounded-2xl bg-slate-50 text-slate-600 hover:text-primary transition-all active:scale-90"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      <div className={`
        lg:hidden fixed inset-0 top-20 bg-white/95 backdrop-blur-md z-50 transition-all duration-500 ease-in-out
        ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"}
      `}>
        <div className="flex flex-col p-6 gap-2">
          <NavLink to="/dashboard" className={linkClass} onClick={() => setIsOpen(false)}>
            <LayoutDashboard className="w-5 h-5" /> Inicio
          </NavLink>
          <NavLink to="/products" className={linkClass} onClick={() => setIsOpen(false)}>
            <Package className="w-5 h-5" /> Productos
          </NavLink>
          <NavLink to="/colors" className={linkClass} onClick={() => setIsOpen(false)}>
            <Palette className="w-5 h-5" /> Colores
          </NavLink>
          <NavLink to="/categories" className={linkClass} onClick={() => setIsOpen(false)}>
            <Tags className="w-5 h-5" /> Categorías
          </NavLink>
          <NavLink to="/sales" className={linkClass} onClick={() => setIsOpen(false)}>
            <Receipt className="w-5 h-5" /> Ventas
          </NavLink>
          
          <div className="h-px bg-slate-100 my-4" />
          
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 bg-accent-red/10 text-accent-red p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
          >
            Cerrar Sesión <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;