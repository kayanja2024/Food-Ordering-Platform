import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'admin';
  isVerified: boolean;
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();

  // Check if user is authenticated on mount
  const { data: user, isLoading: userLoading } = useQuery(
    'user',
    authService.getCurrentUser,
    {
      enabled: !!authState.token,
      retry: false,
      onError: () => {
        logout();
      },
    }
  );

  useEffect(() => {
    if (user) {
      setAuthState({
        user,
        token: authState.token,
        isAuthenticated: true,
      });
    }
    setIsLoading(false);
  }, [user]);

  const loginMutation = useMutation(authService.login, {
    onSuccess: (data) => {
      const { user, token } = data;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      queryClient.invalidateQueries('user');
    },
  });

  const registerMutation = useMutation(authService.register, {
    onSuccess: (data) => {
      const { user, token } = data;
      localStorage.setItem('token', token);
      setAuthState({
        user,
        token,
        isAuthenticated: true,
      });
      queryClient.invalidateQueries('user');
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    queryClient.clear();
  };

  const login = (email: string, password: string) => {
    return loginMutation.mutateAsync({ email, password });
  };

  const register = (userData: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password?: string;
  }) => {
    return registerMutation.mutateAsync(userData);
  };

  const loginWithOTP = (phone: string, otp: string) => {
    return loginMutation.mutateAsync({ phone, otp, method: 'otp' });
  };

  const sendOTP = (phone: string) => {
    return authService.sendOTP(phone);
  };

  const verifyPhone = (phone: string, otp: string) => {
    return authService.verifyPhone(phone, otp);
  };

  const forgotPassword = (email: string) => {
    return authService.forgotPassword(email);
  };

  const resetPassword = (token: string, password: string) => {
    return authService.resetPassword(token, password);
  };

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: isLoading || userLoading,
    login,
    register,
    logout,
    loginWithOTP,
    sendOTP,
    verifyPhone,
    forgotPassword,
    resetPassword,
    isAdmin: authState.user?.role === 'admin',
    isCustomer: authState.user?.role === 'customer',
  };
}; 