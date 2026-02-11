import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

type RegisterFormInputs = { 
    name: string;
    email: string;
    password: string;
}

const validationSchema = Joi.object<RegisterFormInputs>({
    name: Joi.string().min(3).max(30).required().messages({
        "string.base": "Name must be a string",
        "string.empty": "Name is required",
}),
email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).min(3).max(30).required().messages({
        "string.base": "Email must be a string",
        "string.empty": "Email is required",
        "any.required": "Email is required",
        "string.min": "Email must be at least 3 characters long",
        "string.max": "Email must be at most 30 characters long",
        "string.pattern.base": "Email must be a valid email address",
    }),
   password: Joi.string().min(6).max(30).required().messages({
        "string.base": "Password must be a string",
        "string.empty": "Password is required",
        "any.required": "Password is required",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password must be at most 30 characters long",
    })
})

const Register = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [apiError, setApiError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormInputs>({
        resolver: joiResolver(validationSchema),
    });

    const handleRegister = async (formData: RegisterFormInputs) => {
        setApiError(null);

        try {
            const response = await axios.post("http://localhost:3000/api/users/register", formData)

            const { user, token } = response.data;

            if (user && token) {
                login(token, user);
                navigate('/dashboard');
            } else {
                setApiError("Answer from server is missing user or token");
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setApiError(err.response?.data?.message || "Error in registration");
            }
            console.error("Complete error:", err);
        }
    }

 return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-primary/30">
      {/* CARD con tu sombra 'shadow-card' y hover */}
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-card border border-slate-100 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-8 ring-primary/5">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary/30">
              N
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Registro</h1>
          <p className="text-slate-400 font-bold text-[10px] mt-2 uppercase tracking-[0.2em] opacity-80">Únete al equipo Next Zone</p>
        </div>

        {/* ALERTA DE ERROR */}
        {apiError && (
          <div className="mb-6 flex items-center gap-3 bg-accent-red/[0.08] border border-accent-red/20 p-4 rounded-2xl text-accent-red text-xs font-bold animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p><strong>Error:</strong> {apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleRegister)} className="space-y-6">
          {/* CAMPO NOMBRE */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest transition-colors group-focus-within:text-primary">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="Tu nombre" 
                {...register("name")}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 transition-all duration-300 outline-none font-semibold text-slate-700
                  hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary
                  ${errors.name ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
              />
            </div>
            {errors.name && (
  <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase tracking-wide animate-pulse">
    {errors.name.message}
  </span>
)}
          </div>

          {/* CAMPO EMAIL */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest transition-colors group-focus-within:text-primary">
              Email corporativo
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="email@nextzone.com" 
                {...register("email")}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 transition-all duration-300 outline-none font-semibold text-slate-700
                  hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary
                  ${errors.email ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
              />
            </div>
            {errors.email && (
  <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase tracking-wide animate-pulse">
    {errors.email.message}
  </span>
)}
          </div>

          {/* CAMPO PASSWORD */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest transition-colors group-focus-within:text-primary">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="password" 
                placeholder="••••••••" 
                {...register("password")}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 transition-all duration-300 outline-none font-semibold text-slate-700
                  hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary
                  ${errors.password ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
              />
            </div>
            {errors.password && (
  <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase tracking-wide animate-pulse">
    {errors.password.message}
  </span>
)}
          </div>

          {/* BOTÓN REGISTRAR con Icono ArrowRight */}
          <button 
            type="submit"
            className="group relative w-full overflow-hidden bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
          >
            <span className="relative z-10 uppercase tracking-[0.2em] text-sm">Registrar</span>
            <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
          </button>
        </form>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-400 font-semibold tracking-tight">
            ¿Ya tienes una cuenta? {' '}
            <button 
              onClick={() => navigate('/login')}
              className="text-primary font-black hover:text-primary-dark hover:scale-105 transition-all cursor-pointer underline-offset-4 hover:underline ml-1 uppercase"
            >
              Inicia sesión
            </button>
          </p>
        </div>
      </div>
    </div>
);
}

export default Register;