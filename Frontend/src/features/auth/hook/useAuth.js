import { setUser, setLoading, setError, clearError } from "../state/auth.slice.js";
import { register, login, getMe, logout, requestPasswordReset, resetPassword } from "../service/auth.api.js";
import { useDispatch } from "react-redux";

export const useAuth = () => {

    const dispatch = useDispatch();

    /**
     * Extracts the human-readable error message from an axios error.
     * Priority: server JSON message → axios network message → fallback string
     */
    const extractMessage = (error, fallback) =>
        error?.response?.data?.message || error?.message || fallback;

    const handleRegister = async ({ email, contact, password, fullname, isSeller = false }) => {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await register({ email, contact, password, fullname, isSeller });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            const message = extractMessage(error, "Registration failed. Please try again.");
            dispatch(setError(message));
            throw error; // re-throw so the page catch() can also stop its local spinner
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogin = async ({ email, password }) => {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data.user;
        } catch (error) {
            const message = extractMessage(error, "Invalid email or password.");
            dispatch(setError(message));
            throw error; // re-throw so the page catch() can also stop its local spinner
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleGetMe = async () => {
        try {
            dispatch(setLoading(true));
            const data = await getMe();
            dispatch(setUser(data.user));
        } catch (error) {
            // Silent fail — this is a background session check, not user-initiated.
            dispatch(setUser(null));
            console.warn("[useAuth] getMe:", error?.message);
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            // Even if the API fails, always clear the local session.
            console.warn("[useAuth] logout:", error?.message);
        } finally {
            dispatch(setUser(null));
            dispatch(clearError());
        }
    };

    const handleRequestReset = async ({ email }) => {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await requestPasswordReset({ email });
            return data;
        } catch (error) {
            const message = extractMessage(error, "Failed to send reset code.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    const handleResetPassword = async ({ email, otp, newPassword }) => {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await resetPassword({ email, otp, newPassword });
            return data;
        } catch (error) {
            const message = extractMessage(error, "Failed to reset password.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    };

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
        handleRequestReset,
        handleResetPassword,
    };
};
