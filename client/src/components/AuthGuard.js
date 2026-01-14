import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Spin, Result, Button } from 'antd';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthGuard Component
 * 
 * Wraps the main application and ensures proper authentication state management.
 * Controls component mounting based on authentication status and prevents hook
 * execution order changes during authentication transitions.
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1
 */
const AuthGuard = ({ children, fallback = null }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated, isLoading, error } = useAuth();

  // Component mounting control
  const [shouldRenderChildren, setShouldRenderChildren] = useState(false);
  const [isAuthenticationStable, setIsAuthenticationStable] = useState(false);

  // Refs for cleanup and tracking
  const mountedRef = useRef(true);
  const stateChangeTimeoutRef = useRef(null);
  const previousAuthStateRef = useRef(null);

  /**
   * Handle authentication state changes
   * Requirement 1.3: Prevent component mounting until state is stable
   * Requirement 2.1: Unmount components that depend on authentication
   */
  const handleAuthStateChange = useCallback(() => {
    if (!mountedRef.current) return;

    // Mark authentication as unstable during transition
    setIsAuthenticationStable(false);
    setShouldRenderChildren(false);

    // Clear any pending timeouts
    if (stateChangeTimeoutRef.current) {
      clearTimeout(stateChangeTimeoutRef.current);
    }

    // Wait for state to stabilize before allowing component rendering
    stateChangeTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) return;

      setIsAuthenticationStable(true);
      setShouldRenderChildren(true);
    }, 50); // Small delay to ensure state is stable
  }, []);

  /**
   * Handle authentication state transitions
   * Requirement 2.2: Maintain consistent hook lifecycle when components are remounted
   */
  useEffect(() => {
    const currentAuthState = {
      isAuthenticated,
      isLoading
    };

    // Check if authentication state has changed
    if (previousAuthStateRef.current) {
      const prevAuthState = previousAuthStateRef.current;
      
      const hasAuthChanged = 
        prevAuthState.isAuthenticated !== currentAuthState.isAuthenticated ||
        prevAuthState.isLoading !== currentAuthState.isLoading;

      if (hasAuthChanged) {
        handleAuthStateChange();
      }
    }

    previousAuthStateRef.current = currentAuthState;
  }, [isAuthenticated, isLoading, handleAuthStateChange]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (stateChangeTimeoutRef.current) {
        clearTimeout(stateChangeTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Requirement 1.4: Display appropriate loading indicators
   */
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="加载认证信息..." />
      </div>
    );
  }

  /**
   * Requirement 4.1: Recover gracefully when authentication errors occur
   */
  if (error) {
    return (
      <Result
        status="error"
        title="认证错误"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => window.location.reload()}>
            重试
          </Button>
        }
      />
    );
  }

  /**
   * Requirement 2.3: Ensure authentication context is available when rendering
   * Requirement 2.5: Prevent conditional hook execution based on authentication state
   */
  if (!shouldRenderChildren || !isAuthenticationStable) {
    return fallback || (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Spin size="large" tip="初始化中..." />
      </div>
    );
  }

  /**
   * Requirement 1.5: Provide consistent authentication state across all components
   */
  return (
    <div data-testid="auth-guard-content">
      {children}
    </div>
  );
};

AuthGuard.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

AuthGuard.defaultProps = {
  fallback: null
};

export default AuthGuard;
