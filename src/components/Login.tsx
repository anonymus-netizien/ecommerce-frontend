import {type LoginRequest} from "../interfaces/LoginRequest";
import {useForm} from "react-hook-form";
import {serviceLogin} from "../services/AuthService";
import {useState} from "react";
import {Link} from "react-router-dom";
import "./Signup.css";

function Login() {
    const {register, handleSubmit} = useForm<LoginRequest>();
    const [statusMsg, setStatusMsg] = useState<{type: "success" | "error"; text: string} | null>(null);

    const onSubmit = (data: LoginRequest) => {
        serviceLogin(data)
            .then((res) => {
                console.log("Login Response:", res);
                setStatusMsg({type: "success", text: "Welcome back! Redirecting to shop..."});
            })
            .catch((err) => {
                console.error("Login Error:", err);
                setStatusMsg({type: "error", text: "Invalid email or password. Please try again."});
            });
    };

    return (
        <div className="auth-page">
            <div className="signup-container">
                <article className="signup-card glass-panel">
                    <header className="signup-header">
                        <span className="material-symbols-outlined text-5xl text-[var(--color-primary)] mb-3">lock_open</span>
                        <h1 className="signup-header-title">Welcome Back</h1>
                        <p className="signup-header-text">
                            Sign in to access your orders, saved items, and exclusive deals.
                        </p>
                    </header>

                    {statusMsg && (
                        <div className={`signup-alert ${statusMsg.type === "success" ? "alert-success" : "alert-error"}`}>
                            {statusMsg.text}
                        </div>
                    )}

                    <form
                        className="signup-form"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <div className="form-group">
                            <label htmlFor="login-email" className="form-label">Email Address</label>
                            <input
                                id="login-email"
                                className="form-input"
                                type="email"
                                required
                                {...register("email")}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password" className="form-label">Password</label>
                            <input
                                id="login-password"
                                className="form-input"
                                type="password"
                                required
                                {...register("password")}
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            className="signup-submit-btn glass-btn"
                            type="submit"
                        >
                            <span>Sign In</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </form>

                    <footer className="signup-footer">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/signup" className="auth-link">
                                Create one
                            </Link>
                        </p>
                    </footer>
                </article>
            </div>
        </div>
    );
}

export default Login;

