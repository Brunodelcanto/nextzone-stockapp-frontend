import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); 
    navigate("/login");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? "bg-blue-700 text-white" 
        : "text-blue-100 hover:bg-blue-500 hover:text-white"
    }`;

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Nombre */}
          <div className="flex items-center gap-8">
            <h1 className="text-white font-bold text-xl tracking-wider">NEXTZONE</h1>
            
            {/* Links de navegación */}
            <div className="hidden md:flex items-baseline space-x-4">
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/products" className={linkClass}>Productos</NavLink>
              <NavLink to="/colors" className={linkClass}>Colores</NavLink>
              <NavLink to="/categories" className={linkClass}>Categorías</NavLink>
                <NavLink to="/sales" className={linkClass}>Ventas</NavLink>
            </div>
          </div>

          {/* Botón de Logout */}
          <div>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;