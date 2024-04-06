import React from 'react';
import backgroundImage from "../../assets/images/bg_login.jpg";

export const Login = () => {
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
                                            <form className="user">
                                                <div className="form-group">
                                                    <input type="email" className="form-control form-control-user" id="exampleInputEmail" aria-describedby="emailHelp" placeholder="Nhập tên đăng nhập" />
                                                </div>
                                                <div className="form-group">
                                                    <input type="password" className="form-control form-control-user" id="exampleInputPassword" placeholder="Nhập mật khẩu" />
                                                </div>
                                                <a href="index.html" className="btn btn-primary btn-user btn-block">Đăng nhập</a>
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
