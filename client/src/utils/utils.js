import { jwtDecode } from 'jwt-decode';

export const getTokenFromCookie = (cookieName) => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
};

export const handleDecoded = () => {
    let accessToken = getTokenFromCookie("accessToken");
    let decoded = {};
    
    if (accessToken) {
      decoded = jwtDecode(accessToken);
    }

    return { accessToken, decoded };
};

export function getItem(label, key, icon, children, type) {
    return {
      key,
      icon,
      children,
      label,
      type,
    };
}

export const convertFileDataToFiles = (fileDataList) => {
    return fileDataList.map(fileData => {
        const file = new File([null], fileData.name, { type: fileData.type });
        file.path = fileData.path;
        return file;
    });
};