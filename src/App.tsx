import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout';
import AuthGuard from './components/auth/AuthGuard';
import LoadingSpinner from './components/ui/LoadingSpinner';
import HomePage from './pages/HomePage';

// Lazy loaded routes for better performance
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const ListingsPage = lazy(() => import('./pages/listings/ListingsPage'));
const ListingDetailPage = lazy(() => import('./pages/listings/ListingDetailPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/dashboard/ProfilePage'));
const CreateListingPage = lazy(() => import('./pages/listings/CreateListingPage'));
const EditListingPage = lazy(() => import('./pages/listings/EditListingPage'));
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const UserListingsPage = lazy(() => import('./pages/listings/UserListingsPage'));

function App() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />

          {/* Profile is public, not protected */}

          {/* Public user listings page */}
          <Route path="user/:userId/listings" element={<UserListingsPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Protected routes */}
          <Route element={<AuthGuard />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="listings/create" element={<CreateListingPage />} />
            <Route path="listings/edit/:id" element={<EditListingPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="messages/:userId" element={<MessagesPage />} />
            <Route path="messages/:listingId/:receiverId" element={<MessagesPage />} />
          </Route>

          {/* 404 page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;