import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AlertCircle } from 'lucide-react';
import ApiManager from "./services/apimanager";

const LoadingContainer = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffffff',
  zIndex: 9999,
}));

const NotFoundContainer = styled(Box)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#f8f9fa',
  padding: '2rem',
  zIndex: 9999,
}));

const NotFoundBox = styled(Box)(() => ({
  backgroundColor: '#fff',
  borderRadius: '24px',
  padding: '3rem',
  boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
}));

interface TenantMiddlewareProps {
  children: React.ReactNode;
}

const TenantMiddleware: React.FC<TenantMiddlewareProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tenantExists, setTenantExists] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkTenant = async () => {
      try {
        const hostname = window.location.hostname;

        // Whitelist localhost - skip tenant verification for local development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          console.log('Localhost detected - skipping tenant verification');
          setTenantExists(true);
          setIsLoading(false);

          // Store mock tenant data for localhost
          const mockTenantData = {
            _id: 'localhost',
            name: 'Local Development',
            domain: 'localhost',
            email: 'dev@localhost.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem('tenantData', JSON.stringify(mockTenantData));
          localStorage.setItem('tenantDomain', 'localhost');
          return;
        }

        // Extract subdomain from hostname
        let subdomain = '';
        const parts = hostname.split('.');

        if (parts.length >= 3) {
          // e.g., "demo.rayshreeayurveda.com" -> "demo"
          subdomain = parts[0];
        } else if (parts.length === 2) {
          // e.g., "demo.com" -> "demo"
          subdomain = parts[0];
        }

        if (!subdomain) {
          throw new Error('Could not extract subdomain from hostname');
        }

        console.log('Checking tenant for subdomain:', subdomain);

        try {
          const data = await ApiManager.getTenantByDomain(subdomain);
          console.log('API Response:', data);

          if (data.status === true && data.data) {
            // Tenant exists
            console.log('Tenant found:', data.data);

            // Store tenant info in localStorage for later use
            localStorage.setItem('tenantData', JSON.stringify(data.data));
            localStorage.setItem('tenantDomain', subdomain);

            setTenantExists(true);
            setError(null);
          } else {
            // Tenant doesn't exist
            console.log('Tenant not found');
            setTenantExists(false);
            setError(data.message || 'Tenant not found');
          }
        } catch (apiError: any) {
          // Handle API errors
          console.error('API Error:', apiError);
          setTenantExists(false);
          const errorMessage = apiError.response?.data?.message || 'Tenant not found';
          setError(errorMessage);
        }
      } catch (err) {
        console.error('Error checking tenant:', err);
        setTenantExists(false);
        setError('Failed to verify tenant. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    checkTenant();
  }, []);

  // Show loading spinner
  if (isLoading) {
    return (
      <LoadingContainer>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#3b82f6',
            mb: 3,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: '#6b7280',
            fontWeight: 500,
            letterSpacing: '0.025em',
          }}
        >
          Verifying tenant...
        </Typography>
      </LoadingContainer>
    );
  }

  // Show not found if tenant doesn't exist
  if (!tenantExists || error) {
    return (
      <NotFoundContainer>
        <NotFoundBox>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              mb: 3,
              margin: '0 auto 1.5rem',
            }}
          >
            <AlertCircle size={40} color="#ef4444" />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1f2937',
              mb: 2,
              letterSpacing: '-0.025em',
            }}
          >
            Tenant Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#6b7280',
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            {error || 'The tenant you are trying to access does not exist or is not available.'}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: '#9ca3af',
              fontSize: '0.875rem',
            }}
          >
            Please check your URL and try again, or contact support if you believe this is an error.
          </Typography>
        </NotFoundBox>
      </NotFoundContainer>
    );
  }

  // Tenant exists, render children
  return <>{children}</>;
};

export default TenantMiddleware;
