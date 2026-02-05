import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Joi from 'joi';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { joiResolver } from '@hookform/resolvers/joi';
import { useState } from 'react';

type LoginFormInputs = {
    email: string;
    password: string;
}

const validationSchema = Joi.object<LoginFormInputs>({
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
        const response = await axios.post("http://localhost:3000/api/users/login", formData);

        const { user, token } = response.data; 

        if (user && token) {
            login(token, user);
            
            navigate('/dashboard');
        } else {
            setApiError("Answer from server is missing user or token");
        }

    } catch (err) {
        if (axios.isAxiosError(err)) {
            setApiError(err.response?.data?.message || "Error in credentials");
        }
        console.error("Complete error:", err);
    }
};


return (
    <section>
      <form onSubmit={handleSubmit(handleLogin)}>
        <h2>Nextzone Login</h2>
        
        {apiError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            <strong>Error:</strong> {apiError}
          </div>
        )}

        <div>
          <label>Email:</label>
          <input type="email" placeholder='email' {...register('email')}/>
          {errors.email && <span>{errors.email.message}</span>}
        </div>

        <div>
          <label>Password:</label>
          <input type="password" placeholder='password' {...register('password')}/>
          {errors.password && <span>{errors.password.message}</span>}
        </div>

        <button type="submit">
          Entrar
        </button>
      </form>
      <div>
        <p>¿No tienes una cuenta? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/register')}>Regístrate</span></p>
      </div>
    </section>
  );
};

export default Login;