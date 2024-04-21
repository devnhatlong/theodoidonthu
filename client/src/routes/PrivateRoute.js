import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import {  useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
    const user = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(true);

    return (
        user._id ? <Outlet /> : <Navigate to="/login" />
    );
}

export default PrivateRoute;