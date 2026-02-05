import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import axios from "axios";


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
        <section>
            <form onSubmit={handleSubmit(handleRegister)}>
                <h2>Nextzone Register</h2>
                {apiError && (
                    <div style={{ color: 'red', marginBottom: '10px'}}>
                        <strong>Error:</strong> {apiError}
                    </div>
                )}

                <div>
                    <label>Name:</label>
                    <input type="text" placeholder="name" {...register("name")} />
                    {errors.name && <span>{errors.name.message}</span>}
                </div>
                  <div>
                    <label>Email:</label>
                    <input type="text" placeholder="email" {...register("email")} />
                    {errors.email && <span>{errors.email.message}</span>}
                </div>
                  <div>
                    <label>Password:</label>
                    <input type="password" placeholder="password" {...register("password")} />
                    {errors.password && <span>{errors.password.message}</span>}
                </div>

                <button type="submit">
                    Registrar
                </button>
            </form>
            <div>
                <p>¿Ya tienes una cuenta? <span style={{ color: 'blue', cursor: 'pointer' }} onClick={() => navigate('/login')}>Inicia sesión</span></p>
            </div>
        </section>
    )
}

export default Register;