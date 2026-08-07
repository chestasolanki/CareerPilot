import { useContext,useEffect } from "react";
import { AuthContext} from "../auth.context";
import { login,register,logout,getMe } from "../services/auth.api";

export const useAuth = () => {
    const context = useContext(AuthContext)
    const { user, setUser, loading, setLoading } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true);
        try {
            const data = await login({ email, password });
            if (data && data.user) {
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: "Invalid credentials or missing user data" };
        } catch (err) {
            console.error("Login error:", err);
            return { success: false, error: err.message || "Login failed" };
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true);
        try {
            const data = await register({ username, email, password });
            if (data && data.user) {
                setUser(data.user);
                return { success: true };
            }
            return { success: false, error: "Registration failed" };
        } catch (err) {
            console.error("Register error:", err);
            return { success: false, error: err.message || "Registration failed" };
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
            return { success: true };
        } catch (err) {
            console.error("Logout error:", err);
            return { success: false, error: err.message || "Logout failed" };
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, handleLogin, handleRegister, handleLogout };
}
