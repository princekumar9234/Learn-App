import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Video, FileText, ExternalLink, ArrowLeft, Send } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

const CategoryPage = () => {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [unlockError, setUnlockError] = useState(null);

  const fetchCategory = async () => {
    try {
      const res = await axios.get(`/category/${name}`);
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 403) {
        setData({ locked: true });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [name]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setUnlockError(null);
    try {
      await axios.post(`/category/${name}/unlock`, { password });
      window.location.reload(); // Refresh to fetch now-unlocked content
    } catch (err) {
      setUnlockError(err.response?.data?.error || 'Incorrect Password');
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [activeVideo]);

  if (loading) return <div className="container" style={{paddingTop:'5rem'}}>Loading resources...</div>;

  if (data?.locked) {
    return (
      <div className="container" style={{minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <div className="glass-card" style={{padding:'3rem', textAlign:'center', maxWidth:'450px'}}>
           <div style={{background:'rgba(239, 68, 68, 0.1)', color:'#ef4444', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 2rem'}}>
             <Send size={30} />
           </div>
           <h2 style={{fontSize:'2.5rem', fontWeight:'800', marginBottom:'1rem'}}>Portal Locked</h2>
           <p style={{color:'var(--text-dim)', marginBottom:'2rem'}}>This curriculum is protected. Enter your access key to unlock {name}.</p>
           
           {unlockError && <div style={{color:'#ef4444', marginBottom:'1.5rem', fontWeight:'600'}}>{unlockError}</div>}
           
           <form onSubmit={handleUnlock} style={{display:'flex', gap:'1rem', width: '100%'}}>
             <input 
              type="password" 
              placeholder="Access Key" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{flex:1}}
             />
             <button type="submit" className="btn btn-primary" style={{padding:'1rem 1.5rem'}}>Unlock</button>
           </form>
           
           <Link to="/dashboard" style={{display:'inline-block', marginTop:'2rem', color:'var(--text-dim)', fontSize:'0.9rem'}}>← Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{paddingTop:'3rem', paddingBottom:'5rem'}}>
      <Link to="/dashboard" style={{display:'flex', alignItems:'center', gap:'0.5rem', color:'var(--text-dim)', fontWeight:'600', marginBottom:'2rem'}}>
        <ArrowLeft size={18}/> Back to Categories
      </Link>
      
      <h1 className="heading" style={{fontSize:'3.5rem', fontWeight:'900', marginBottom:'3rem'}}>{name} <span style={{color:'var(--text-dim)', fontWeight:'400'}}>Curriculum</span></h1>

      <div className="grid">
        {data.resources.length > 0 ? data.resources.map((res, i) => (
          <div key={i} className="glass-card animate" style={{padding:'2rem', display:'flex', flexDirection:'column', gap:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{color:'var(--primary)', fontWeight:'700', fontSize:'0.85rem', textTransform:'uppercase', tracking:'0.1em'}}>
                {res.type}
              </div>
              <div style={{color:'var(--text-dim)'}}>
                {res.type === 'video' ? <Video size={18}/> : <FileText size={18}/>}
              </div>
            </div>
            
            <h3 style={{fontSize:'1.3rem', lineHeight:'1.4'}}>{res.title}</h3>
            <p style={{color:'var(--text-dim)', fontSize:'0.9rem', marginBottom:'1rem'}}>{res.description}</p>
            
            {res.type === 'video' ? (
              <button 
                onClick={() => setActiveVideo(res)}
                className="btn btn-primary" 
                style={{marginTop:'auto', justifyContent:'center', width:'100%'}}
              >
                 Watch Now <Video size={16}/>
              </button>
            ) : (
              <a href={res.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{marginTop:'auto', justifyContent:'center'}}>
                 Learn Now <ExternalLink size={16}/>
              </a>
            )}
          </div>
        )) : (
          <div style={{gridColumn:'1 / -1', textAlign:'center', color:'var(--text-dim)', padding:'4rem'}}>
             No resources found in this category yet.
          </div>
        )}
      </div>

      {/* Video Modal Overlay */}
      {activeVideo && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%', 
          background:'rgba(0,0,0,0.9)', backdropFilter:'blur(10px)',
          zIndex:10000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'5rem 2rem 2rem',
          overflowY:'auto'
        }}>
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="glass-card" 
             style={{width:'100%', maxWidth:'1000px', padding:'1.5rem', position:'relative', border:'1px solid rgba(255,255,255,0.1)', marginBottom:'2rem'}}
           >
              <button 
                onClick={() => setActiveVideo(null)}
                className="btn btn-ghost"
                style={{position:'absolute', top:'-4rem', right:0, color:'var(--text-main)', borderRadius:'50%', width:'45px', height:'45px', justifyContent:'center', border:'1px solid var(--border)', background:'var(--glass)'}}
              >
                ✕
              </button>
              
              <div style={{aspectRatio:'16/9', width:'100%', background:'black', borderRadius:'1rem', overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,0.5)'}}>
                <iframe
                  width="100%"
                  height="100%"
                  src={getYoutubeEmbedUrl(activeVideo.url)}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              
              <div style={{marginTop:'1.5rem'}}>
                <div style={{color:'var(--primary)', fontWeight:'700', fontSize:'0.75rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.5rem'}}>
                  Streaming Now
                </div>
                <h3 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'0.5rem'}}>{activeVideo.title}</h3>
                <p style={{color:'var(--text-dim)', fontSize:'0.95rem', lineHeight:'1.6'}}>{activeVideo.description}</p>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}

export default CategoryPage
