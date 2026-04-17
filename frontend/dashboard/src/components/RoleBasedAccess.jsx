import React from 'react';

const ROLE_HIERARCHY = {
  admin: 3,
  senior_analyst: 2,
  analyst: 1,
};

export function hasRole(requiredRole) {
  const userRole = localStorage.getItem('user_role') || 'analyst';
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[requiredRole] || 0);
}

export function getUserRole() {
  return localStorage.getItem('user_role') || 'analyst';
}

export function getUserName() {
  return localStorage.getItem('user_name') || 'User';
}

export default function RoleGate({ requiredRole, children, fallback }) {
  if (hasRole(requiredRole)) {
    return children;
  }
  return fallback || (
    <div className="p-6 text-center text-gray-400">
      <p className="text-lg font-semibold">Access Restricted</p>
      <p className="text-sm mt-1">You need <span className="font-bold text-white">{requiredRole}</span> role or above.</p>
    </div>
  );
}
