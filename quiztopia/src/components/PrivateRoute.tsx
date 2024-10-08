import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const token = localStorage.getItem('token'); 

  return token ? (
    <>{children}</> 
  ) : (
    <Navigate to="/login" /> 
  );
}

export default PrivateRoute;
