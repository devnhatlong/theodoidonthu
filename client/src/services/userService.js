import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';

export const axiosJWT = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWT.interceptors.request.use(
    (config) => {
        const accessToken = getTokenFromCookie("accessToken_QLDT");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to refresh the JWT token if it's expired
axiosJWT.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken_QLDT");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken_QLDT=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWT(originalRequest);
            } catch (refreshError) {
                // Handle refresh token error
                console.error(refreshError);
                // You may want to redirect to login page or handle this in your application accordingly
                // Redirect to login page or handle accordingly
                redirectToLogin();
                return Promise.reject(error);
            }
        }

        // If error is 401 and no refresh token, assume user needs to logout
        if (error.response.status === 401 && !refreshToken) {
            // Redirect to login page and clear tokens
            redirectToLogin();
        }

        return Promise.reject(error);
    }
);

const redirectToLogin = () => {
    // Clear tokens from cookie
    document.cookie = "accessToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refreshToken=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    // Redirect to login page
    window.location.href = "/login";
};

const userService = {
    login: async (values) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/user/login`, values);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    logout: async (refreshToken) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/user/logout`, { refreshToken });

            return response.data;
        } catch (error) {
            throw error; // Rethrow the error for handling in interceptor
        }
    },
    getUser: async (refreshToken) => {
        try {
            const response = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/user/get-user`,  {
                headers: {
                    authorization: `Bearer ${refreshToken}`,
                }
            });

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAllUser: async (currentPage, pageSize, filters = {}) => {
        try {
            const response = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/user/get-all-user`, {
                params: {
                    filters,
                    currentPage,
                    pageSize
                }
            });

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getDetailUser: async (id) => {
        try {
            const response = await axiosJWT.get(`${process.env.REACT_APP_SERVER_URL}/user/get-detail-user/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    register: async (data) => {
        try {
            const response = await axiosJWT.post(`${process.env.REACT_APP_SERVER_URL}/user/register`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    updateUserByAdmin: async (id, data) => {
        try {
            const response = await axiosJWT.put(`${process.env.REACT_APP_SERVER_URL}/user/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    passwordChangedByAdmin: async (id, data) => {
        try {
            const response = await axiosJWT.put(`${process.env.REACT_APP_SERVER_URL}/user/change-password-by-admin/${id}`, data);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await axiosJWT.delete(`${process.env.REACT_APP_SERVER_URL}/user/delete-user/${id}`);
            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    deleteMultipleUsers: async (ids) => {
        try {
            const response = await axiosJWT.delete(`${process.env.REACT_APP_SERVER_URL}/user/delete-multiple-users`, { data: { ids } });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    },
    getRefreshToken: async (refreshToken) => {
        try {
            const response = await axiosJWT.post(`${process.env.REACT_APP_SERVER_URL}/user/refreshtoken`, { refreshToken });

            return response.data;
        } catch (error) {
            throw error; // Rethrow the error for handling in interceptor
        }
    }
};

export default userService;
