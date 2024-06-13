import { Popover } from 'antd'
import React from 'react'
import iconUser from "../../assets/icons/icon_user.png";
import { WrapperContentPopup, WrapperHeaderContainerLogin } from './style';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import { getTokenFromCookie } from '../../utils/utils';
import { clearUser } from '../../redux/userSlice';
import { LogoutOutlined } from '@ant-design/icons'

export const NavbarLoginComponent = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate(); 
    const dispatch = useDispatch();

    const content = (
        <div>
            <WrapperContentPopup style={{display: "flex"}} onClick={() => handleLogout()}><LogoutOutlined style={{fontSize: '20px', cursor: 'pointer', marginRight: "5px"}}/> Đăng xuất</WrapperContentPopup>
        </div>
    );

    const handleLogout = async () => {
        let refreshToken = getTokenFromCookie("refreshToken_QLDT");

        if (refreshToken) {
            await userService.logout(refreshToken);

            // Clear tokens from cookie
            document.cookie = "accessToken_QLDT=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            document.cookie = "refreshToken_QLDT=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            // clear redux
            dispatch(clearUser());
        }

        navigate("/login");
    }

    return (
        <WrapperHeaderContainerLogin>
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow" style={{width: "100%"}}>
                {/* Sidebar Toggle (Topbar) */}
                <div>THEO DÕI ĐƠN THƯ</div>
                {/* Topbar Navbar */}
                <ul className="navbar-nav ml-auto">
                {/* Nav Item - Search Dropdown (Visible Only XS) */}
                <li className="nav-item dropdown no-arrow d-sm-none">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="searchDropdown"
                        role="button"
                        data-toggle="dropdown"
                        aria-haspopup="true"
                        aria-expanded="false"
                    >
                    <i className="fas fa-search fa-fw" />
                    </a>
                    {/* Dropdown - Messages */}
                    <div
                    className="dropdown-menu dropdown-menu-right p-3 shadow animated--grow-in"
                    aria-labelledby="searchDropdown"
                    >
                    <form className="form-inline mr-auto w-100 navbar-search">
                        <div className="input-group">
                        <input
                            type="text"
                            className="form-control bg-light border-0 small"
                            placeholder="Search for..."
                            aria-label="Search"
                            aria-describedby="basic-addon2"
                        />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="button">
                            <i className="fas fa-search fa-sm" />
                            </button>
                        </div>
                        </div>
                    </form>
                    </div>
                </li>
                
                <div className="topbar-divider d-none d-sm-block" />
                {/* Nav Item - User Information */}
                <Popover content={content}>
                    <li className="nav-item dropdown no-arrow">
                        <a
                            className="nav-link dropdown-toggle"
                            href="#"
                            id="userDropdown"
                            role="button"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                        <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                            {user?.userName}
                        </span>
                        <img className="img-profile rounded-circle" src={iconUser} />
                        </a>
                        
                    </li>
                </Popover>
                </ul>
            </nav>
        </WrapperHeaderContainerLogin>
    )
}
