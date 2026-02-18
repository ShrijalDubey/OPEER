import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('auth_error');

            if (error) {
                console.error('Auth error:', error);
                navigate('/', { replace: true });
                return;
            }

            if (token) {
                await login(token);
                // ProfileSetupModal will auto-show if profile is incomplete
                navigate('/', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        };

        handleAuth();
    }, [searchParams, navigate, login]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            color: '#a1a1aa',
            fontSize: '18px',
        }}>
            <span className="spinner" style={{ marginRight: '12px' }}></span>
            Signing you in...
        </div>
    );
};

export default AuthCallback;
