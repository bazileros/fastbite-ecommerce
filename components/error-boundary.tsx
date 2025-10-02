'use client';

import {
  Component,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { ConvexError } from 'convex/values';

import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  isNetworkError?: boolean;
  isAuthError?: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a network/connectivity error
    const isNetworkError = error.message?.includes('fetch') ||
                          error.message?.includes('network') ||
                          error.message?.includes('Failed to fetch') ||
                          error.name === 'NetworkError';

    // Check if it's an authentication error
    const isAuthError = error.message?.includes('Not authenticated') ||
                       error.message?.includes('Unauthorized') ||
                       error.message?.includes('authentication');

    return {
      hasError: true,
      error,
      isNetworkError,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Log additional context for debugging
    if (error instanceof ConvexError) {
      console.error('Convex Error details:', error.data);
    }

    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, isNetworkError: undefined, isAuthError: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Network error UI
      if (this.state.isNetworkError) {
        return (
          <Card className="mx-auto w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center bg-orange-100 dark:bg-orange-900/20 mx-auto mb-4 rounded-full w-12 h-12">
                <WifiOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-orange-900 dark:text-orange-100">
                Connection Problem
              </CardTitle>
              <CardDescription>
                Unable to connect to our servers. Please check your internet connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={this.handleRetry} className="w-full">
                <Wifi className="mr-2 w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        );
      }

      // Authentication error UI
      if (this.state.isAuthError) {
        return (
          <Card className="mx-auto w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/20 mx-auto mb-4 rounded-full w-12 h-12">
                <AlertTriangle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please sign in to continue using this feature.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => { window.location.href = '/auth/sign-in'; }} className="w-full">
                Sign In
              </Button>
            </CardContent>
          </Card>
        );
      }

      // Generic error UI
      return (
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center bg-red-100 dark:bg-red-900/20 mx-auto mb-4 rounded-full w-12 h-12">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-900 dark:text-red-100">
              Something went wrong
            </CardTitle>
            <CardDescription>
              We encountered an error while loading this component.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={this.handleRetry} className="mb-4 w-full">
              <RefreshCw className="mr-2 w-4 h-4" />
              Try Again
            </Button>
            {(process.env.NODE_ENV === 'development' || this.props.showDetails) && this.state.error && (
              <details className="text-left">
                <summary className="mb-2 font-medium text-sm cursor-pointer">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto font-mono text-xs">
                  <div className="mb-1 font-semibold">Error:</div>
                  <div className="mb-2 text-red-600 dark:text-red-400">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="mb-1 font-semibold">Stack Trace:</div>
                      <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}