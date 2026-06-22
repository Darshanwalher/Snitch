import { useDispatch } from "react-redux";
import {
    addProductVariant,
    createProduct,
    deleteProduct,
    getAllProducts,
    searchProducts,
    getProductById,
    getSellerProducts,
    deleteProductVariant,
    updateProductVariant,
    updateProduct,
} from "../service/product.api.js";
import {
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
} from "../state/product.slice.js";

export const useProduct = () => {

    const dispatch = useDispatch();

    /**
     * Extracts a human-readable message from an axios error.
     * Priority: server JSON message → axios message → fallback string
     */
    const extractMessage = (error, fallback) =>
        error?.response?.data?.message || error?.message || fallback;

    async function handleCreateProduct(formData) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await createProduct(formData);
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to create product. Please try again.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetSellerProducts(params) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getSellerProducts(params);
            dispatch(setSellerProducts(data.products));
            dispatch(setSellerPagination(data.pagination));
            return data.products;
        } catch (error) {
            const message = extractMessage(error, "Failed to fetch your products.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetAllProducts(params) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getAllProducts(params);
            dispatch(setProducts(data.products));
            dispatch(setPagination(data.pagination));
        } catch (error) {
            const message = extractMessage(error, "Failed to fetch products.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleSearchProducts(params) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await searchProducts(params);
            dispatch(setProducts(data.products));
            dispatch(setPagination(data.pagination));
            return data.products;
        } catch (error) {
            const message = extractMessage(error, "Failed to search products.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetProductById(productId) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await getProductById(productId);
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to fetch product details.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleAddProductVariant(productId, newProductVariant) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await addProductVariant(productId, newProductVariant);
            return data;
        } catch (error) {
            const message = extractMessage(error, "Failed to add product variant.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteProduct(productId) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await deleteProduct(productId);
            dispatch(setDeleteProduct(productId));
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to delete product.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleDeleteProductVariant(productId, variantId) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await deleteProductVariant(productId, variantId);
            dispatch(setDeleteProductVariant({ productId, variantId }));
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to delete product variant.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateProductVariant(productId, variantId, updatedVariant) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await updateProductVariant(productId, variantId, updatedVariant);
            dispatch(setUpdateProductVariant({ productId, variantId, variant: data.product }));
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to update product variant.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleUpdateProduct(productId, updatedProduct) {
        dispatch(setLoading(true));
        dispatch(clearError());
        try {
            const data = await updateProduct(productId, updatedProduct);
            dispatch(setUpdateProduct(data.product));
            return data.product;
        } catch (error) {
            const message = extractMessage(error, "Failed to update product.");
            dispatch(setError(message));
            throw error;
        } finally {
            dispatch(setLoading(false));
        }
    }

    return {
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetAllProducts,
        handleSearchProducts,
        handleGetProductById,
        handleAddProductVariant,
        handleDeleteProduct,
        handleDeleteProductVariant,
        handleUpdateProductVariant,
        handleUpdateProduct,
    };
};
