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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* RUTAS PRIVADAS */}
        <Route element={<ProtectedRoute />}>
          <Route 
            path="/dashboard" 
            element={
              <div>
                <h1>Panel de Control</h1>
                <p>Bienvenido al sistema de stock de Nextzone.</p>
              </div>
            } 
          />
          <Route path="/products" element={<ProductList />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />
          <Route path="/colors" element={<ColorPage />} />
          <Route path="/edit-color/:id" element={<EditColor />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/edit-category/:id" element={<EditCategory />} />
        </Route>

        {/* CUALQUIER OTRA RUTA: Redirige al Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;