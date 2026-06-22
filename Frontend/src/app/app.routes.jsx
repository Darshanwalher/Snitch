import { createBrowserRouter } from "react-router";
import Register from "../features/auth/pages/Register";
import Login from "../features/auth/pages/Login.jsx";
import ForgotPassword from "../features/auth/pages/ForgotPassword.jsx";
import CreateProduct from "../features/products/pages/CreateProduct.jsx";
import Dashboard from "../features/products/pages/Dashboard.jsx";
import Protected from "../features/auth/components/Protected.jsx";
import { Home } from "../features/products/pages/Home.jsx";
import ProductDetail from "../features/products/pages/ProductDetail.jsx";
import SellerProductDetail from "../features/products/pages/SellerProductDetail.jsx";
import Cart from "../features/cart/pages/Cart.jsx";
import OrderSuccess from "../features/cart/pages/OrderSuccess.jsx";
import { SearchProducts } from "../features/products/pages/SearchProducts.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/search",
        element: <SearchProducts />,
    },
    {
        path: "/register",
        element: <Register />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />,
    },
    {
        path: "/product/:productId",
        element: <ProductDetail />,
    },
    {
        path: "/cart",
        element: (
            <Protected>
                <Cart />
            </Protected>
        ),
    },
    {
        path: "/order-success",
        element: (
            <Protected>
                <OrderSuccess />
            </Protected>
        ),
    },
    {
        path: "/seller",
        children: [
            {
                path: "create-product",
                element: (
                    <Protected role="seller">
                        <CreateProduct />
                    </Protected>
                ),
            },
            {
                path: "dashboard",
                element: (
                    <Protected role="seller">
                        <Dashboard />
                    </Protected>
                ),
            },
            {
                path: "product/:productId",
                element: (
                    <Protected role="seller">
                        <SellerProductDetail />
                    </Protected>
                ),
            },
        ],
    },
]);