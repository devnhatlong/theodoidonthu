import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import "./styles/sb-admin-2.min.css";
import userService from './services/userService';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/userSlice';
import Loading from "./components/LoadingComponent/Loading";
import { handleDecoded } from './utils/utils';
import AppRoutes from "./routes/AppRoutes";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleGetDetailsUser = async (accessToken) => {
    const response = await userService.getUser(accessToken);
    dispatch(setUser(response.result));
    setIsLoading(false);
  };

  useEffect(() => {
    setIsLoading(true);
    const { accessToken, decoded } = handleDecoded();

    if (decoded?._id) {
      handleGetDetailsUser(accessToken);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleGetDetailsUser, handleDecoded])

  return (
    <Loading isLoading = {isLoading}>
      <div className="App" id="wrapper">
        {!isLoading && ( // Render AppRoutes chỉ khi dữ liệu user đã được load
            <Router>
              <AppRoutes />
            </Router>
        )}
      </div>
    </Loading>
  );
}

export default App;
