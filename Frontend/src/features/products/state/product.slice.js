import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
    name: "product",
    initialState: {
        sellerProducts: [],
        products: [],
        pagination: null,
        sellerPagination: null,
        loading: false,
        error: null,
    },
    reducers: {
        setSellerProducts: (state, action) => {
            state.sellerProducts = action.payload;
        },

        setPagination: (state, action) => {
            state.pagination = action.payload;
        },

        setSellerPagination: (state, action) => {
            state.sellerPagination = action.payload;
        },

        setProducts: (state, action) => {
            state.products = action.payload;
        },

        setDeleteProduct(state, action) {
            state.products = state.products.filter((p) => p.id !== action.payload);
        },

        setDeleteProductVariant: (state, action) => {
            state.sellerProducts = state.sellerProducts.map((p) => {
                if (p.id === action.payload.productId) {
                    p.variants = p.variants.filter((v) => v.id !== action.payload.variantId);
                }
                return p;
            });
        },

        setUpdateProductVariant: (state, action) => {
            state.sellerProducts = state.sellerProducts.map((p) => {
                if (p.id === action.payload.productId) {
                    p.variants = p.variants.map((v) => {
                        if (v.id === action.payload.variantId) {
                            return action.payload.variant;
                        }
                        return v;
                    });
                }
                return p;
            });
        },

        setUpdateProduct: (state, action) => {
            state.products = state.products.map((p) =>
                p.id === action.payload.id ? action.payload : p
            );
            state.sellerProducts = state.sellerProducts.map((p) =>
                p.id === action.payload.id ? action.payload : p
            );
        },

        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
        },

        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    setSellerProducts,
    setProducts,
    setPagination,
    setSellerPagination,
    setDeleteProduct,
    setDeleteProductVariant,
    setUpdateProductVariant,
    setUpdateProduct,
    setLoading,
    setError,
    clearError,
} = productSlice.actions;

export default productSlice.reducer;