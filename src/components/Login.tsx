import {type LoginRequest} from "../interfaces/LoginRequest";
import {useForm} from "react-hook-form";
import {serviceLogin} from "../services/AuthService";
import {useState} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import "./Signup.css";

function Login() {
    const {register, handleSubmit} = useForm<LoginRequest>();
    const [statusMsg, setStatusMsg] = useState<{type: "success" | "error"; text: string} | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string })?.from || "/";
    const isRedirected = from !== "/";

    const onSubmit = (data: LoginRequest) => {
        serviceLogin(data)
            .then((res) => {
                console.log("Login Response:", res);
                const redirectLabel = from === "/checkout" ? "checkout" : from === "/orders" ? "orders" : "shop";
                setStatusMsg({type: "success", text: `Welcome back! Redirecting to ${redirectLabel}...`});
                
                // Programmatic redirect back to the page they came from
                setTimeout(() => {
                    navigate(from, { replace: true });
                }, 1500);
            })
            .catch((err: any) => {
                console.error("Login Error:", err);
                setStatusMsg({
                    type: "error",
                    text: err.message || "Invalid email or password. Please try again."
                });
            });
    };

    return (
        <div className="auth-page">
            <div className="signup-container">
                <article className="signup-card glass-panel">
                    <header className="signup-header">
                        <span className="material-symbols-outlined text-5xl text-[var(--color-primary)] mb-3">lock_open</span>
                        <h1 className="signup-header-title">Welcome Back</h1>
                        {isRedirected ? (
                            <p className="signup-header-text">
                                Please sign in to continue. Don&apos;t have an account? <Link to="/signup" className="auth-link">Create one</Link> below. Your cart items are saved and will be waiting for you.
                            </p>
                        ) : (
                            <p className="signup-header-text">
                                Sign in to access your orders, saved items, and exclusive deals.
                            </p>
                        )}
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

