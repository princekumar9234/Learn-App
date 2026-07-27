import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import CategoryPage from './pages/CategoryPage'
import AdminDashboard from './pages/AdminDashboard'
import ManageAccess from './pages/ManageAccess'
import ManageStudents from './pages/ManageStudents'
import Navbar from './components/Navbar'
import axios from 'axios'

// Set axios defaults for cross-origin sessions
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api'; // Use Vite proxy for session cookies to work head scripts and deps h

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth status on load
    const checkAuth = async () => {
      try {
        // Student session
        const res = await axios.get('/dashboard');
        if (res.data.student) setUser(res.data.student);
      } catch (err) {
        setUser(null);
      }

      try {
        // Admin session
        const adminRes = await axios.get('/admin/dashboard');
        if (adminRes.data && typeof adminRes.data.studentCount === 'number') {
          setAdmin({ id: 'session-admin', email: 'admin' });
        }
      } catch (err) {
        setAdmin(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>Loading...</div>;

  return (
    <Router>
      <Navbar user={user} admin={admin} setUser={setUser} setAdmin={setAdmin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/category/:name" element={user ? <CategoryPage /> : <Navigate to="/login" />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={!admin ? <Login isAdmin setUser={setAdmin} /> : <Navigate to="/admin/dashboard" />} />
        <Route path="/admin/dashboard" element={admin ? <AdminDashboard /> : <Navigate to="/admin" />} />
        <Route path="/admin/manage-access" element={admin ? <ManageAccess /> : <Navigate to="/admin" />} />
        <Route path="/admin/manage-students" element={admin ? <ManageStudents /> : <Navigate to="/admin" />} />
      </Routes>
    </Router>
  )
}

export default App
