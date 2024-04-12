import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation  } from 'react-router-dom';

const PrivateRoute = (props) => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate(); 
    const currentLocation = useLocation();
    console.log("PrivateRoute-user: ", user);

    // useEffect(() => {
    //     if (user._id === "" && currentLocation.pathname !== '/login') {
    //         console.log("PrivateRoute-user1: ", user);
    //         navigate('/login');
    //     }
    // }, [user, currentLocation.pathname, navigate]);

    return (
        <>
            {props.children}
        </>
    )
}

export default PrivateRoute;
