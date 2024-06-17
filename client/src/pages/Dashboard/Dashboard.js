import React, { useState } from "react";
import { NavbarLoginComponent } from "../../components/NavbarLoginComponent/NavbarLoginComponent";
import { FooterComponent } from "../../components/FooterComponent/FooterComponent";
import { UserOutlined, MailOutlined } from '@ant-design/icons';
import { getItem } from "../../utils/utils";
import { LetterComponent } from "../../components/LetterComponent/LetterComponent";
import { Menu } from 'antd';
import { AdminUser } from "../../components/AdminUser/AdminUser";
import { useSelector } from 'react-redux';

export const Dashboard = () => {
    const user = useSelector((state) => state.user);
    const items  = [
        user?.role === "admin" && getItem('Người dùng', 'user', <UserOutlined />),
    
        getItem('Đơn thư', 'letter', <MailOutlined />),
    ];

    const [keySelected, setKeySelected] = useState('');

    const renderPage = (key) => {
        switch (key) {
            case 'user':
                return (
                    <AdminUser></AdminUser>
                )
            
            case 'letter':
                return (
                    <LetterComponent></LetterComponent>
                )
        
            default:
                return <></>
        }
    }

    const handleOnClick = ({ key }) => {
        setKeySelected(key)
    }
    
    return (
        <>
            <div style={{display: "flex", position: "absolute", zIndex: "1", top: "75px", width: "100%"}}>
                <Menu
                    mode="inline"
                    style={{ width: '170px', boxShadow: '1px 1px 2px #ccc', height: "90vh" }}
                    items={items}
                    onClick={handleOnClick}
                />
                <div style={{padding: '15px', flex: '1', overflowY: "scroll"}}>
                    {renderPage(keySelected)}
                </div>
            </div>
            
            <NavbarLoginComponent />    
            {/* <FooterComponent /> */}
        </>
    );
};
