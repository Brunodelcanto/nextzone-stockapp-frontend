import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login/Login'
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import Register from "./pages/Register/Register";
import ProductList from "./pages/Product/Product";
import EditProduct from "./components/editProduct/EditProduct";
import ColorPage from "./pages/Color/Color";
import EditColor from "./components/editColor/EditColor";
import CategoryPage from "./pages/Category/Category";
import EditCategory from "./components/editCategory/editCategory";
import Navbar from "./components/navBar/NavBar";
import SalePage from "./pages/Sale/Sale";
import Dashboard from "./pages/Dashboard/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA (Sin Navbar) */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* RUTAS PRIVADAS (Con Navbar y Layout unificado) */}
        <Route element={<ProtectedRoute />}>
          <Route path="*" element={
            <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
              <Navbar /> 
              
              {/* Contenedor Principal con padding uniforme */}
              <div className="flex-1 w-full max-w-[1600px] mx-auto transition-all duration-500">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard /> } />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/edit-product/:id" element={<EditProduct />} />
                  <Route path="/colors" element={<ColorPage />} />
                  <Route path="/edit-color/:id" element={<EditColor />} />
                  <Route path="/categories" element={<CategoryPage />} />
                  <Route path="/edit-category/:id" element={<EditCategory />} />
                  <Route path="/sales" element={<SalePage />} />
                </Routes>
              </div>
            </div>
          } />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;