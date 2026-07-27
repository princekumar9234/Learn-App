import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Lock, ChevronRight, GraduationCap } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="container" style={{paddingTop:'5rem', textAlign:'center'}}>Loading your dashboard...</div>;
  if (!data) return <div className="container" style={{paddingTop:'5rem', textAlign:'center'}}>Failed to load data.</div>;

  return (
    <div className="container" style={{paddingTop:'3rem', paddingBottom:'5rem'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4rem'}}>
        <div>
          <h1 style={{fontSize:'3rem', fontWeight:'800', marginBottom:'0.5rem'}}>Hello, {user.name} 👋</h1>
          <p style={{color:'var(--text-dim)', fontSize:'1.1rem'}}>What would you like to learn today?</p>
        </div>
        <div className="glass-card" style={{padding:'1rem 2rem', display:'flex', alignItems:'center', gap:'1rem'}}>
          <div style={{background:'var(--primary)', padding:'0.8rem', borderRadius:'50%'}}><GraduationCap /></div>
          <div>
            <div style={{fontWeight:'700'}}>Learning Path</div>
            <div style={{fontSize:'0.8rem', color:'var(--text-dim)'}}>Full Stack Dev</div>
          </div>
        </div>
      </header>

      <section className="grid">
        {data.categories.map((cat, i) => {
          const isProtected = data.protectedCategories.includes(cat);
          const isUnlocked = data.unlockedCategories.includes(cat);
          
          return (
            <Link key={i} to={`/category/${cat}`} className="glass-card animate" style={{padding:'2rem', position:'relative', border:'1px solid var(--border)', overflow:'hidden', group:'true'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem'}}>
                <div style={{background:isProtected && !isUnlocked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding:'0.8rem', borderRadius:'12px', color:isProtected && !isUnlocked ? '#ef4444' : 'var(--primary)'}}>
                  {isProtected && !isUnlocked ? <Lock size={20}/> : <BookOpen size={20}/>}
                </div>
                <ChevronRight size={18} style={{color:'var(--text-dim)'}} />
              </div>

              <h3 style={{fontSize:'1.4rem', marginBottom:'0.5rem'}}>{cat}</h3>
              <p style={{color:'var(--text-dim)', fontSize:'0.9rem'}}>Explore curated resources for {cat} mastery.</p>
              
              {isProtected && !isUnlocked && (
                <div style={{marginTop:'1.5rem', fontSize:'0.8rem', color:'#ef4444', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                   Locked Resource
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  )
}

export default Dashboard
