import react, { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { useAuth } from "../features/auth/hook/useAuth.js";


const App = () => {
    const {handleGetMe} = useAuth();


    

    useEffect(()=>{
        handleGetMe();
    },[])
    
    return (
        <>
            <RouterProvider router={router} />
        </>
    );
};

export default App;