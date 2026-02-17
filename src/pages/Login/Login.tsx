import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { joiResolver } from '@hookform/resolvers/joi';
import { useState } from 'react';
import { Lock, Mail, AlertCircle } from 'lucide-react'; 

type LoginFormInputs = {
    email: string;
    password: string;
}

const validationSchema = Joi.object<LoginFormInputs>({
    email: Joi.string().pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).min(3).max(30).required().messages({
        "string.empty": "El email es obligatorio",
        "string.min": "Mínimo 3 caracteres",
        "string.max": "Máximo 30 caracteres",
        "string.pattern.base": "Formato de email inválido",
    }),
    password: Joi.string().min(6).max(30).required().messages({
        "string.empty": "La contraseña es obligatoria",
        "string.min": "Mínimo 6 caracteres",
        "string.max": "Máximo 30 caracteres",
    })
})

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: joiResolver(validationSchema),
  });

  const handleLogin = async (formData: LoginFormInputs) => {
    setApiError(null);
    try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, formData, {
          withCredentials: true,
        });

        const { user } = response.data; 

        if (user) {
            login(user);
            navigate('/dashboard');
        } else {
            setApiError("Respuesta incompleta del servidor");
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            setApiError(err.response?.data?.message || "Error en las credenciales");
        }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 selection:bg-primary/30">
      {/* CARD: Aumentamos la sombra y agregamos un borde sutil para que resalte más */}
      <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-card border border-slate-100 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1">
        
        <div className="text-center mb-12">
          {/* LOGO: Con un pulso suave de fondo */}
          <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 ring-8 ring-primary/5">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/30">
              N
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none">ACCESO</h1>
          <p className="text-slate-400 font-bold text-[10px] mt-3 uppercase tracking-[0.3em] opacity-80">Next Zone Stock System</p>
        </div>

        {/* ERRORES: Diseño más limpio con glassmorphism sutil */}
        {apiError && (
          <div className="mb-8 flex items-center gap-3 bg-accent-red/[0.08] border border-accent-red/20 p-4 rounded-2xl text-accent-red text-xs font-bold animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-7">
          {/* INPUT EMAIL */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest transition-colors group-focus-within:text-primary">
              Credenciales de Usuario
            </label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="email" 
                placeholder='nombre@empresa.com'
                {...register('email')}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 transition-all duration-300 outline-none font-semibold text-slate-700
                  hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary
                  ${errors.email ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
              />
            </div>
            {errors.email && <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase animate-pulse">{errors.email.message}</span>}
          </div>

          {/* INPUT PASSWORD */}
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 tracking-widest transition-colors group-focus-within:text-primary">
              Contraseña Segura
            </label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 transition-colors group-focus-within:text-primary" />
              <input 
                type="password" 
                placeholder='••••••••'
                {...register('password')}
                className={`w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] py-4 pl-14 pr-6 transition-all duration-300 outline-none font-semibold text-slate-700
                  hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-primary/10 focus:border-primary
                  ${errors.password ? 'border-accent-red/30 bg-accent-red/[0.02]' : ''}`}
              />
            </div>
            {errors.password && <span className="text-[10px] font-bold text-accent-red ml-2 mt-2 inline-block uppercase animate-pulse">{errors.password.message}</span>}
          </div>

          {/* BOTÓN: Efecto de brillo y escala al presionar */}
          <button 
            type="submit"
            className="group relative w-full overflow-hidden bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/30 transition-all duration-300 hover:bg-primary-dark hover:shadow-2xl hover:shadow-primary/40 active:scale-[0.98] cursor-pointer"
          >
            <span className="relative z-10 uppercase tracking-[0.2em] text-sm">Entrar al Sistema</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
          </button>
        </form>

        <div className="text-center mt-12">
          <p className="text-sm text-slate-400 font-semibold tracking-tight">
            ¿Eres nuevo en el equipo? {' '}
            <button 
              onClick={() => navigate('/register')}
              className="text-primary font-black hover:text-primary-dark hover:scale-105 transition-all cursor-pointer underline-offset-4 hover:underline ml-1"
            >
              CREAR CUENTA
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;