import React from 'react'
import { Link } from 'react-router-dom'
import { Rocket, Code2, Database, ShieldCheck, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const Home = () => {
  const features = [
    { icon: <Code2 size={24}/>, title: 'Master Frontend', desc: 'Step-by-step guides for HTML, CSS, and JS to build beautiful apps.' },
    { icon: <Database size={24}/>, title: 'Backend Power', desc: 'Secure database management with MongoDB and Node.js logic.' },
    { icon: <ShieldCheck size={24}/>, title: 'Enterprise Auth', desc: 'Learn to build professional-grade auth and session security.' }
  ];

  return (
    <div className="container" style={{paddingTop:'4rem'}}>
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{textAlign:'center', marginBottom:'6rem'}}
      >
        <span style={{color:'var(--primary)', fontWeight:'700', textTransform:'uppercase', fontSize:'0.85rem', tracking:'0.1em'}}>A Professional Web Mastery Platform</span>
        <h1 style={{fontSize:'4.5rem', fontWeight:'900', lineHeight:'1.1', marginTop:'2rem', maxWidth:'900px', margin:'2rem auto'}}>
          Level up your <span style={{background:'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>Full Stack</span> skills.
        </h1>
        <p style={{color:'var(--text-dim)', fontSize:'1.25rem', maxWidth:'650px', margin:'2rem auto', lineHeight:'1.8'}}>
          From scratch to professional developer. Access curated resources, master the MERN stack, and build real-world projects today.
        </p>
        
        <div style={{display:'flex', gap:'1.5rem', justifyContent:'center', marginTop:'3rem'}}>
          <Link to="/signup" className="btn btn-primary" style={{padding:'1rem 2.5rem', fontSize:'1.1rem'}}>
            Start Free Trial <Rocket size={20}/>
          </Link>
          <Link to="/login" className="btn" style={{border:'1px solid var(--border)', padding:'1rem 2.5rem', fontSize:'1.1rem'}}>
            Access Portal
          </Link>
        </div>
      </motion.section>

      {/* Feature Grid */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid"
      >
        {features.map((f, i) => (
          <div key={i} className="glass-card animate" style={{padding:'2.5rem', border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
            <div style={{width:'50px', height:'50px', borderRadius:'12px', background:'var(--primary-glow)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--primary)'}}>
              {f.icon}
            </div>
            <h3 style={{fontSize:'1.5rem'}}>{f.title}</h3>
            <p style={{color:'var(--text-dim)'}}>{f.desc}</p>
            <Link to="/signup" style={{color:'var(--primary)', fontWeight:'600', display:'flex', alignItems:'center', gap:'0.5rem', fontSize:'0.9rem', marginTop:'auto'}}>
              Learn More <ArrowRight size={16}/>
            </Link>
          </div>
        ))}
      </motion.section>
      
      <footer style={{textAlign:'center', marginTop:'10rem', padding:'4rem 0', color:'var(--text-dim)', fontSize:'0.9rem', borderTop:'1px solid var(--border)'}}>
        © 2026 Learn.Dev Global. Build with React + Node.js
      </footer>
    </div>
  )
}

export default Home
