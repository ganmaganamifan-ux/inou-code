import React from 'react';
import { createRoot } from 'react-dom/client';
import IndexPage from './pages/_index';
import './base.css';
const root=document.getElementById('root');
if(root)createRoot(root).render(<React.StrictMode><IndexPage/></React.StrictMode>);
