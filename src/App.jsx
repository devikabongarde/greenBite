import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { UserProvider } from '@/UserContext.jsx';

import HomePage from './pages/HomePage';
import ItemPage from './pages/ItemPage';
import Dashboard from './pages/Dashboard';
import Achievements from './pages/Achievements';
import Ngodonations from './pages/Ngodonations';
import Crowdfunding from './pages/Crowdfunding';
import Chatbot from './pages/Chatbot';
import Documentation from './pages/Documentation';
import About from './pages/About';
import Account from './pages/Account';
import Help from './pages/Help';
import NotFound from './pages/NotFound';
import AuthPage from './pages/AuthPage';


const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  
  {
    path: '/',
    children: [
      { path: 'items', element: <ItemPage /> },
      { path: 'help', element: <Help /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'achievements', element: <Achievements /> },
      { path: 'donations', element: <Ngodonations /> },
      { path: 'crowdfunding', element: <Crowdfunding /> },
      { path: 'chatbot', element: <Chatbot /> },
      { path: 'docs', element: <Documentation /> },
      { path: 'about', element: <About /> },
      { path: 'account', element: <Account /> },
    ],
  },
  {
    path: '*', // this will match any other undefined paths
    element: <NotFound /> // 404 page will show
  }
]);

function App() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}

export default App;
