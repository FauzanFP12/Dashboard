// UserContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Coba ambil user dari localStorage saat komponen pertama kali dimuat
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        sessionStorage.setItem('user', JSON.stringify(userData)); // Simpan ke localStorage
        setUser(userData); // Set user di state
    };

    const logout = () => {
        sessionStorage.removeItem('user'); // Hapus user dari localStorage
        setUser(null); // Set user ke null
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    return useContext(UserContext);
};
