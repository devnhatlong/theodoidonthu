import { Routes, Route } from 'react-router-dom';
import { Login } from "../pages/Login/Login";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import PrivateRoute from "./PrivateRoute";

const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route 
                    path="/" 
                    element= {
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route path="/login" element={<Login />} />
                
            </Routes>
        </>
    )
}

export default AppRoutes;
