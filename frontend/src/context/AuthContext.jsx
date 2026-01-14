import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const ROLES = {
    ADMIN: 'Admin',
    EDITOR: 'Editor',
    VIEWER: 'Viewer'
};

const PERMISSIONS = {
    [ROLES.ADMIN]: ['manage_team', 'manage_settings', 'approve_loans', 'edit_loans', 'view_reports', 'view_all'],
    [ROLES.EDITOR]: ['edit_loans', 'view_reports', 'view_all'],
    [ROLES.VIEWER]: ['view_all']
};

const MOCK_USERS = {
    [ROLES.ADMIN]: { name: "Sarah Chen", role: ROLES.ADMIN, avatar: "SC", email: "sarah.chen@verdebank.com" },
    [ROLES.EDITOR]: { name: "Marcus Johnson", role: ROLES.EDITOR, avatar: "MJ", email: "m.johnson@verdebank.com" },
    [ROLES.VIEWER]: { name: "Elena Rodriguez", role: ROLES.VIEWER, avatar: "ER", email: "e.rodriguez@verdebank.com" }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(MOCK_USERS[ROLES.ADMIN]);
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    const login = (role) => {
        const mockUser = MOCK_USERS[role] || MOCK_USERS[ROLES.VIEWER];
        setUser(mockUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
    };

    const hasPermission = (permission) => {
        if (!user) return false;
        const userPermissions = PERMISSIONS[user.role] || [];
        return userPermissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            hasPermission,
            hasRole,
            ROLES
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
