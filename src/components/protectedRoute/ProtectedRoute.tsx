import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if(loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
                {/* Spinner con los colores de Nextzone */}
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 w-12 h-12 border-4 border-primary/10 rounded-full" />
                </div>
                
                <div className="text-center">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] animate-pulse">
                        Verificando Credenciales
                    </p>
                    <p className="text-slate-300 font-bold text-[8px] uppercase tracking-[0.2em] mt-1">
                        Next Zone Stock System
                    </p>
                </div>
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;