import {Gender, Role, type SignupRequest} from "../interfaces/SignupRequest";
import {useForm} from "react-hook-form";
import {serviceRegister} from "../services/AuthService";
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import "./Signup.css";

function Signup() {
    const {register, handleSubmit, reset} = useForm<SignupRequest>();
    const [statusMsg, setStatusMsg] = useState<{type: "success" | "error"; text: string} | null>(null);
    const navigate = useNavigate();

    const onSubmit = async (data: SignupRequest) => {
        try {
            console.log("Submitting Signup Data:", data);

            // Execute service register which handles localStorage flow
            await serviceRegister(data);

            setStatusMsg({type: "success", text: "Account created successfully! Redirecting to login..."});
            
            // Programmatic redirect after 1.5 seconds so user can see success message
            setTimeout(() => {
                navigate("/login");
            }, 1500);
            
            reset();
        } catch (err: any) {
            console.error("Register Error:", err);
            setStatusMsg({
                type: "error",
                text: err.message || "Registration failed. Please check your inputs and try again."
            });
        }
    };

    return (
        <div className="auth-page">
            <div className="signup-container">
                <article className="signup-card glass-panel">
                    <header className="signup-header">
                        <span className="material-symbols-outlined text-5xl text-[var(--color-primary)] mb-3">auto_awesome</span>
                        <h1 className="signup-header-title">Join ShopVibe</h1>
                        <p className="signup-header-text">
                            Create your account to unlock curated collections, order tracking, and exclusive discounts.
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
                            <label htmlFor="signup-name" className="form-label">Full Name</label>
                            <input
                                id="signup-name"
                                className="form-input"
                                type="text"
                                required
                                {...register("name")}
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-email" className="form-label">Email Address</label>
                            <input
                                id="signup-email"
                                className="form-input"
                                type="email"
                                required
                                {...register("email")}
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-phone" className="form-label">Phone Number</label>
                            <input
                                id="signup-phone"
                                className="form-input"
                                type="number"
                                required
                                {...register("phoneNumber", {valueAsNumber: true})}
                                placeholder="Enter 10-digit mobile number"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="signup-gender" className="form-label">Gender</label>
                                <select
                                    id="signup-gender"
                                    className="form-select"
                                    {...register("gender")}
                                >
                                    <option value={Gender.MALE}>Male</option>
                                    <option value={Gender.FEMALE}>Female</option>
                                    <option value={Gender.OTHER}>Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="signup-role" className="form-label">Role</label>
                                <select id="signup-role" className="form-select" {...register("role")}>
                                    <option value={Role.ROLE_CUSTOMER}>Customer</option>
                                    <option value={Role.ROLE_ADMIN}>Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="signup-password" className="form-label">Password</label>
                            <input
                                id="signup-password"
                                className="form-input"
                                type="password"
                                required
                                {...register("password")}
                                placeholder="Create a secure password"
                            />
                        </div>

                        <button
                            className="signup-submit-btn glass-btn"
                            type="submit"
                        >
                            <span>Create My Account</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </form>

                    <footer className="signup-footer">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">
                                Sign in
                            </Link>
                        </p>
                    </footer>
                </article>
            </div>
        </div>
    );
}

export default Signup;

