import axios from 'axios';
import { getTokenFromCookie } from '../utils/utils';
import userService from './userService';

export const axiosJWTLetter = axios.create();

// Add a request interceptor to add the JWT token to the authorization header
axiosJWTLetter.interceptors.request.use(
    (config) => {
        const accessToken = getTokenFromCookie("accessToken");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to refresh the JWT token if it's expired
axiosJWTLetter.interceptors.response.use(
    async (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = getTokenFromCookie("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const { newAccessToken } = await userService.getRefreshToken(refreshToken);
                document.cookie = `accessToken=${newAccessToken}; path=/`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return axiosJWTLetter(originalRequest);
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

const letterService = {
    createLetter: async (data) => {
        try {
            const response = await axiosJWTLetter.post(`${process.env.REACT_APP_SERVER_URL}/letter/create-letter`, data);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    getAllLetter: async (currentPage, pageSize) => {
        try {
            const response = await axiosJWTLetter.get(`${process.env.REACT_APP_SERVER_URL}/letter/get-all-letter?currentPage=${currentPage}&pageSize=${pageSize}`);

            return response.data;
        } 
        catch (error) {
            console.log(error);
        }
    },
    searchLetters: async (searchParams, currentPage, pageSize) => {
        try {
            const response = await axiosJWTLetter.get(`${process.env.REACT_APP_SERVER_URL}/letter/search`, {
                params: {
                    searchParams,
                    currentPage,
                    pageSize
                }
            });
            return response.data;
        } catch (error) {
            console.log(error);
        }
    }
};

export default letterService;