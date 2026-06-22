import axios from "axios";


const authApiInstance = axios.create({
    baseURL: `/api/auth`,
    withCredentials: true,
})

export const register = async ({email,contact,password,fullname,isSeller})=>{

    const response = await authApiInstance.post("/register",{
        email,
        contact,
        password,
        fullname,
        isSeller
    });

    return response.data;
    
}

export const login = async ({email,password})=>{

    const response = await authApiInstance.post("/login",{
        email,
        password,
    })
    return response.data;
}

export const getMe = async()=>{
    const response = await authApiInstance.get("/me");
    return response.data;
}

export const logout = async()=>{
    const response = await authApiInstance.get("/logout");
    return response.data;
}

export const requestPasswordReset = async ({ email }) => {
    const response = await authApiInstance.post("/forgot-password", { email });
    return response.data;
}

export const resetPassword = async ({ email, otp, newPassword }) => {
    const response = await authApiInstance.post("/reset-password", { email, otp, newPassword });
    return response.data;
}
