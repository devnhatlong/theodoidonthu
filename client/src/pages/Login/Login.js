import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Thêm useDispatch
import { useNavigate } from "react-router-dom";
import backgroundImage from "../../assets/images/bg_login.jpg";
import userService from '../../services/userService';
import { setUser } from '../../redux/userSlice'; // Import action
import Loading from '../../components/LoadingComponent/Loading';
import * as message from '../../components/Message/Message';

export const Login = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch(); // Sử dụng useDispatch
    const navigate = useNavigate(); 

    const [values, setValues] = useState({
        userName: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userService.login(values);
            
            if (response.success) {
                // Lưu thông tin người dùng vào Redux store
                await dispatch(setUser(response.message.userData));
                // Lưu accessToken vào cookie
                document.cookie = `accessToken_QLDT=${response.accessToken}; path=/`;
                document.cookie = `refreshToken_QLDT=${response.newRefreshToken}; path=/`;
                // localStorage.setItem("")
                // Chuyển hướng đến /dashboard
                // navigate('/');
            } else {
                message.error("Sai tài khoản hoặc mật khẩu");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        // Kiểm tra nếu người dùng đã đăng nhập thì chuyển hướng đến trang '/'
        if (user._id) {
            message.success("Đăng nhập thành công");
            navigate('/');
        }
    }, [user, navigate]);

    return (
        <div className="outer-container" style={{backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh', width: "100%"}}>
            <div className="container">
                {/* Inner Container */}
                <div className="row justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
                    <div className="col-lg-6">
                        <div className="card o-hidden border-0 shadow-lg my-5" style={{ boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)' }}>
                            <div className="card-body p-0">
                                {/* Nested Row within Card Body */}
                                <div className="row justify-content-center">
                                    <div className="col-lg-12">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-4">Đăng nhập tài khoản</h1>
                                            </div>
                                            <form className="user" onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                    <input type="text" className="form-control form-control-user" placeholder="Nhập tên đăng nhập" autoComplete="current-username"
                                                    onChange={(e) => setValues({...values, userName: e.target.value})}/>
                                                </div>
                                                <div className="form-group">
                                                    <input type="password" className="form-control form-control-user" placeholder="Nhập mật khẩu" autoComplete="current-password"
                                                    onChange={(e) => setValues({...values, password: e.target.value})}/>
                                                </div>
                                                {/* {
                                                    error && (
                                                        <div className='alert alert-danger' role='alert'>{error}</div>
                                                    )
                                                } */}
                                                {/* <a className="btn btn-primary btn-user btn-block">Đăng nhập</a> */}
                                                <button type='submit' className='btn btn-primary btn-user btn-block'>Đăng nhập</button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
