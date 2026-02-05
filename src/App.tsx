import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login/Login'
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
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
        </Route>

        {/* CUALQUIER OTRA RUTA: Redirige al Dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;