import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { NavbarProvider } from './contexts/NavbarContext.jsx';
import { AuthContextProvider } from './contexts/AuthContext.jsx';
import { PlaylistContextProvider } from './contexts/PlaylistContext.jsx';
import { ConnectionContextProvider } from './contexts/ConnectionContext.jsx';
import SuspenseWrapper from './components/SuspenseWrapper.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const ConnectionDashboard = lazy(() => import('./pages/ConnectionDashboard.jsx'));
const Playlistselection = lazy(() => import('./pages/Playlistselection.jsx'));
const TransferSuccess = lazy(() => import('./pages/TransferSuccess.jsx'));
const TransfersHistory = lazy(() => import('./pages/TransfersHistory.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <Home />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'connectionDashboard',
        element: (
          <SuspenseWrapper>
            <ConnectionDashboard />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'playlistselection',
        element: (
          <SuspenseWrapper>
            <Playlistselection />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'transfer-success',
        element: (
          <SuspenseWrapper>
            <TransferSuccess />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'transfers',
        element: (
          <SuspenseWrapper>
            <TransfersHistory />
          </SuspenseWrapper>
        ),
      },
    ],
  },
  {
    path: 'login',
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <PlaylistContextProvider>
        <ConnectionContextProvider>
          <NavbarProvider>
            <RouterProvider router={router} />
          </NavbarProvider>
        </ConnectionContextProvider>
      </PlaylistContextProvider>
    </AuthContextProvider>
  </StrictMode>
);
