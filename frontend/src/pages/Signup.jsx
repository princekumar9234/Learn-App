import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Key, ArrowRight } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

const Signup = ({ setUser }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', secretPin: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/signup', formData);
      setUser(res.data.student);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'4rem 0'}}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{width:'100%', maxWidth:'480px', padding:'3rem'}}>
        <div style={{textAlign:'center', marginBottom:'3rem'}}>
          <h2 style={{fontSize:'2.5rem', fontWeight:'900'}}>Create Account</h2>
          <p style={{color:'var(--text-dim)', marginTop:'0.5rem'}}>Join the global developer community</p>
        </div>

        {error && (
          <div style={{background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', padding:'1rem', borderRadius:'0.8rem', marginBottom:'1.5rem', textAlign:'center', border:'1px solid rgba(239, 68, 68, 0.2)'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
          <div className="input-group" style={{position:'relative'}}>
             <User size={18} style={{position:'absolute', left:'1.2rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none'}} />
             <input 
               type="text" 
               placeholder="Full Name" 
               required 
               value={formData.name} 
               onChange={(e) => setFormData({...formData, name: e.target.value})} 
               className="input-field" 
               style={{paddingLeft: '3.5rem'}}
             />
          </div>

          <div className="input-group" style={{position:'relative'}}>
             <Mail size={18} style={{position:'absolute', left:'1.2rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none'}} />
             <input 
               type="email" 
               placeholder="Email Address" 
               required 
               value={formData.email} 
               onChange={(e) => setFormData({...formData, email: e.target.value})} 
               className="input-field" 
               style={{paddingLeft: '3.5rem'}}
             />
          </div>

          <div className="input-group" style={{position:'relative'}}>
             <Lock size={18} style={{position:'absolute', left:'1.2rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none'}} />
             <input 
               type="password" 
               placeholder="Password" 
               required 
               value={formData.password} 
               onChange={(e) => setFormData({...formData, password: e.target.value})} 
               className="input-field" 
               style={{paddingLeft: '3.5rem'}}
             />
          </div>

          <div className="input-group" style={{position:'relative'}}>
             <Key size={18} style={{position:'absolute', left:'1.2rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', pointerEvents:'none'}} />
             <input 
               type="text" 
               placeholder="Secret Recovery PIN" 
               required 
               value={formData.secretPin} 
               onChange={(e) => setFormData({...formData, secretPin: e.target.value})} 
               className="input-field" 
               style={{paddingLeft: '3.5rem'}}
             />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{width:'100%', justifyContent:'center', padding:'1.1rem', marginTop:'1.5rem'}}>
            {loading ? 'Creating Account...' : <>Sign Up Now <ArrowRight size={20}/></>}
          </button>
        </form>

        <p style={{textAlign:'center', marginTop:'2.5rem', color:'var(--text-dim)'}}>
          Already a member? <Link to="/login" style={{color:'var(--primary)', fontWeight:'700'}}>Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Signup
