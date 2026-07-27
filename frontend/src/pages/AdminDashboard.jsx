import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Layout, Database, Edit, Trash2, Lock, Unlock } from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [resources, setResources] = useState([]);
  const [students, setStudents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [lockCategoryEnabled, setLockCategoryEnabled] = useState(false);
  const [lockCategoryPassword, setLockCategoryPassword] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'video',
    url: '',
    category: ''
  });

  const navigate = useNavigate()

  const normalizeGoogleDriveUrl = (url) => {
    if (!url) return url;

    // If already looks like a direct download, keep it.
    if (url.includes('uc?export=download') && url.includes('id=')) return url;

    // Examples:
    // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // https://drive.google.com/open?id=FILE_ID
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }

    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch?.[1]) {
      return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
    }

    // For non-drive URLs, return as-is.
    return url;
  };

  const loadData = async () => {
    try {
      const res = await axios.get('/admin/dashboard');
      const res2 = await axios.get('/admin/resources');
      const res3 = await axios.get('/admin/students');
      const res4 = await axios.get('/admin/categories');
      setStats(res);
      setResources(res2.data.resources || []);
      setStudents(res3.data.students || []);
      setCategories(res4.data.categories || []);
    } catch (err) {
      console.error('Error fetching admin data', err);
      setError(err.response?.data?.error || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewForm = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      type: 'video',
      url: '',
      category: ''
    });
    setPdfFile(null);
    setLockCategoryEnabled(false);
    setLockCategoryPassword('');
    setError(null);
    setShowForm(true);
  };

  const openEditForm = (resource) => {
    setEditing(resource);
    setForm({
      title: resource.title || '',
      description: resource.description || '',
      type: resource.type || 'video',
      url: resource.url || '',
      category: resource.category || ''
    });
    setPdfFile(null);
    const cat = categories.find((c) => c.name === (resource.category || ''));
    setLockCategoryEnabled(!!cat?.password);
    setLockCategoryPassword('');
    setError(null);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Frontend validation (backend also validates/multer handles file types)
      if (!form.title?.trim()) throw new Error('Title is required');
      if (!form.description?.trim()) throw new Error('Description is required');
      if (!form.category?.trim()) throw new Error('Category is required');

      const isPdf = form.type === 'pdf';
      const hasUrl = !!form.url?.trim();

      if (isPdf) {
        // For PDF: allow either upload OR URL (including Google Drive share links)
        if (!pdfFile && !hasUrl && !editing) throw new Error('PDF upload or URL is required');
      } else {
        // For video/link: URL is required
        if (!hasUrl && !editing) throw new Error('URL is required');
      }

      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('category', form.category);
      fd.append('lockCategoryEnabled', lockCategoryEnabled);
      fd.append('lockCategoryPassword', lockCategoryPassword);

      if (pdfFile) fd.append('pdf', pdfFile);

      // Only send url when it is provided (for edit, empty should keep existing)
      if (form.url?.trim()) {
        fd.append('url', form.type === 'pdf' ? normalizeGoogleDriveUrl(form.url.trim()) : form.url.trim());
      }

      if (editing) {
        const resp = await axios.post(`/admin/resource/edit/${editing._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const saved = resp.data?.resource;
        if (saved?._id) {
          setResources((prev) => prev.map((r) => (r._id === saved._id ? saved : r)));
        }
      } else {
        const resp = await axios.post('/admin/resource/add', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const saved = resp.data?.resource;
        if (saved?._id) {
          setResources((prev) => [saved, ...prev]);
        }
      }

      // Update counts/categories indicators; even if this fails, UI state is already updated.
      await loadData();
      setShowForm(false);
      setEditing(null);
      setPdfFile(null);
      setLockCategoryEnabled(false);
      setLockCategoryPassword('');
    } catch (err) {
      console.error('Save resource error', err);
      if (err?.response?.status === 401) {
        setError('Admin session expired. Please login again.');
        setShowForm(false);
        setEditing(null);
      } else {
        setError(err?.response?.data?.error || err?.message || 'Failed to save resource.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`Delete resource "${resource.title}"?`)) return;
    try {
      await axios.post(`/admin/resource/delete/${resource._id}`);
      setResources((prev) => prev.filter((r) => r._id !== resource._id));
    } catch (err) {
      console.error('Delete resource error', err);
      if (err?.response?.status === 401) {
        alert('Admin session expired. Please login again.');
      } else {
        alert(err.response?.data?.error || 'Failed to delete resource.');
      }
    }
  };

  const toggleBlockStudent = async (student) => {
    try {
      const res = await axios.post(`/admin/student/block/${student._id}`);
      const updated = res.data.student;
      setStudents((prev) =>
        prev.map((s) => (s._id === updated._id ? updated : s))
      );
    } catch (err) {
      console.error('Block/unblock student error', err);
      alert(err.response?.data?.error || 'Failed to update student status.');
    }
  };

  const toggleCategoryLockByName = async (categoryName) => {
    const cat = categories.find((c) => c.name === categoryName);
    if (!cat) {
      alert('Category not found.');
      return;
    }

    try {
      const isLocked = !!cat.password;
      if (isLocked) {
        // Unlock category
        await axios.post('/admin/categories/update-password', {
          categoryId: cat._id,
          password: ''
        });
      } else {
        // Lock category: admin needs to set a password
        const newPassword = window.prompt(`Set lock password for "${categoryName}"`);
        if (!newPassword) return;
        await axios.post('/admin/categories/update-password', {
          categoryId: cat._id,
          password: newPassword
        });
      }

      // Refresh categories + resources lock indicators
      const res4 = await axios.get('/admin/categories');
      setCategories(res4.data.categories || []);
    } catch (err) {
      console.error('toggleCategoryLockByName error', err);
      alert(err.response?.data?.error || 'Failed to update category lock.');
    }
  };

  if (loading) return <div className="container" style={{paddingTop:'5rem'}}>Loading admin portal...</div>;

  return (
    <div className="container" style={{paddingTop:'3rem', paddingBottom:'5rem'}}>
      <header style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4rem'}}>
        <div>
          <h1 style={{fontSize:'3rem', fontWeight:'900', marginBottom:'0.5rem'}}>Control Center</h1>
          <p style={{color:'var(--text-dim)', fontSize:'1.1rem'}}>Platform management and analytics</p>
        </div>
        <button className="btn btn-primary" style={{padding:'1rem 2rem'}} onClick={openNewForm}>
          <Plus size={20}/> New Resource
        </button>
      </header>

      {error && (
        <div style={{
          marginBottom:'1.5rem', 
          padding:'1rem 1.25rem', 
          borderRadius:'0.8rem', 
          border:'1px solid rgba(248,113,113,0.4)', 
          background:'rgba(248,113,113,0.08)', 
          color:'#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <section className="grid" style={{marginBottom:'4rem'}}>
        <div className="glass-card" style={{padding:'2.5rem', textAlign:'center', position:'relative'}}>
          <div style={{color:'var(--primary)', marginBottom:'1rem'}}><Users size={32}/></div>
          <div style={{fontSize:'2.5rem', fontWeight:'800'}}>{stats?.data?.studentCount}</div>
          <div style={{color:'var(--text-dim)', fontSize:'0.9rem', textTransform:'uppercase', tracking:'0.1em'}}>Students Registered</div>
          <div style={{marginTop:'1.5rem'}}>
            <button
              className="btn btn-ghost"
              style={{padding:'0.8rem 1.2rem', justifyContent:'center', width:'100%'}}
              type="button"
              onClick={() => navigate('/admin/manage-students')}
            >
              Manage Students
            </button>
          </div>
        </div>
        <div className="glass-card" style={{padding:'2.5rem', textAlign:'center', position:'relative'}}>
          <div style={{color:'var(--secondary)', marginBottom:'1rem'}}><Layout size={32}/></div>
          <div style={{fontSize:'2.5rem', fontWeight:'800'}}>{stats?.data?.categoryCount}</div>
          <div style={{color:'var(--text-dim)', fontSize:'0.9rem', textTransform:'uppercase', tracking:'0.1em'}}>Categories</div>
          <div style={{marginTop:'1.5rem'}}>
            <button
              className="btn btn-ghost"
              style={{padding:'0.8rem 1.2rem', justifyContent:'center', width:'100%'}}
              type="button"
              onClick={() => navigate('/admin/manage-access')}
            >
              Manage Access
            </button>
          </div>
        </div>
        <div className="glass-card" style={{padding:'2.5rem', textAlign:'center', position:'relative'}}>
          <div style={{color:'var(--primary)', marginBottom:'1rem'}}><Database size={32}/></div>
          <div style={{fontSize:'2.5rem', fontWeight:'800'}}>{stats?.data?.resourceCount}</div>
          <div style={{color:'var(--text-dim)', fontSize:'0.9rem', textTransform:'uppercase', tracking:'0.1em'}}>Total Resources</div>
          <div style={{marginTop:'1.5rem', display:'flex', gap:'0.8rem', justifyContent:'center'}}>
            <button
              className="btn btn-primary"
              style={{padding:'0.8rem 1.2rem', justifyContent:'center'}}
              type="button"
              onClick={openNewForm}
            >
              Add New
            </button>
            <button
              className="btn btn-ghost"
              style={{padding:'0.8rem 1.2rem', justifyContent:'center'}}
              type="button"
              onClick={() => document.getElementById('recent-content')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View All
            </button>
          </div>
        </div>
      </section>

      {/* Students Table */}
      <section className="glass-card" style={{padding:'2.5rem', overflowX:'auto', marginBottom:'3rem'}}>
        <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'2rem'}}>Registered Students</h2>
        {students.length === 0 ? (
          <p style={{color:'var(--text-dim)'}}>No students registered yet.</p>
        ) : (
          <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)', color:'var(--text-dim)', textTransform:'uppercase', fontSize:'0.8rem', letterSpacing:'0.08em'}}>
                <th style={{padding:'1.2rem 1rem'}}>Name</th>
                <th style={{padding:'1.2rem 1rem'}}>Email</th>
                <th style={{padding:'1.2rem 1rem'}}>Status</th>
                <th style={{padding:'1.2rem 1rem', textAlign:'right'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="table-row-hover" style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'1.2rem 1rem', fontWeight:'600'}}>{s.name}</td>
                  <td style={{padding:'1.2rem 1rem', color:'var(--text-dim)'}}>{s.email}</td>
                  <td style={{padding:'1.2rem 1rem'}}>
                    <span style={{
                      padding:'0.35rem 0.8rem',
                      borderRadius:'999px',
                      fontSize:'0.8rem',
                      fontWeight: '600',
                      background: s.isBlocked ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34,197,94,0.15)',
                      color: s.isBlocked ? '#ef4444' : '#22c55e'
                    }}>
                      {s.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{padding:'1.2rem 1rem', textAlign:'right'}}>
                    <button
                      className="btn btn-ghost"
                      style={{padding:'0.6rem 1.1rem', fontSize:'0.85rem'}}
                      onClick={() => toggleBlockStudent(s)}
                    >
                      {s.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Recent Resources Table */}
      <section id="recent-content" className="glass-card" style={{padding:'2.5rem', overflowX:'auto'}}>
        <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'2rem'}}>Recent Content</h2>
        <table style={{width:'100%', textAlign:'left', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--border)', color:'var(--text-dim)', textTransform:'uppercase', fontSize:'0.8rem', tracking:'0.1em'}}>
              <th style={{padding:'1.5rem 1rem'}}>Title</th>
              <th style={{padding:'1.5rem 1rem'}}>Category</th>
              <th style={{padding:'1.5rem 1rem'}}>Type</th>
              <th style={{padding:'1.5rem 1rem', textAlign:'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((res) => (
              <tr key={res._id} style={{borderBottom:'1px solid var(--border)', transition:'var(--transition)'}} className="table-row-hover">
                <td style={{padding:'1.5rem 1rem', fontWeight:'600'}}>{res.title}</td>
                <td style={{padding:'1.5rem 1rem'}}><span style={{background:'var(--bg-accent)', padding:'0.4rem 0.8rem', borderRadius:'20px', fontSize:'0.85rem'}}>{res.category}</span></td>
                <td style={{padding:'1.5rem 1rem', textTransform:'capitalize'}}>{res.type}</td>
                  <td style={{padding:'1.5rem 1rem', textAlign:'right'}}>
                     <div style={{display:'flex', gap:'1rem', justifyContent:'flex-end'}}>
                       <button style={{color:'var(--primary)'}} onClick={() => openEditForm(res)} title="Edit Resource"><Edit size={18}/></button>
                       <button style={{color:'#ef4444'}} onClick={() => handleDelete(res)} title="Delete Resource"><Trash2 size={18}/></button>
                       <button
                         style={{color: categories.find((c) => c.name === res.category)?.password ? 'var(--secondary)' : 'var(--text-dim)'}}
                         onClick={() => toggleCategoryLockByName(res.category)}
                         title={categories.find((c) => c.name === res.category)?.password ? "Unlock Category" : "Lock Category"}
                       >
                         {categories.find((c) => c.name === res.category)?.password ? <Unlock size={18}/> : <Lock size={18}/>}
                       </button>
                     </div>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showForm && (
        <div style={{
          position:'fixed',
          inset:0,
          background:'var(--glass-deep)',
          backdropFilter:'blur(20px)',
          display:'flex',
          alignItems:'flex-start',
          justifyContent:'center',
          padding:'1.2rem 0',
          zIndex:2000
        }}>
          <div
            className="glass-card"
            style={{
              width:'100%',
              maxWidth:'520px',
              padding:'2.2rem',
              maxHeight:'85vh',
              overflowY:'auto'
            }}
          >
            <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginBottom:'1.5rem'}}>
              {editing ? 'Edit Resource' : 'Add New Resource'}
            </h2>

            {error && (
              <div style={{marginBottom:'1rem', padding:'0.85rem 1rem', borderRadius:'0.7rem', border:'1px solid rgba(248,113,113,0.4)', background:'rgba(248,113,113,0.08)', color:'#fecaca', fontSize:'0.9rem'}}>
                {error}
              </div>
            )}

            <form onSubmit={handleSave} style={{display:'flex', flexDirection:'column', gap:'1.2rem'}}>
              <div>
                <label className="label-text">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label-text">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="input-field"
                  style={{resize:'vertical'}}
                />
              </div>

              <div style={{display:'flex', gap:'1.2rem', flexWrap: 'wrap'}}>
                <div style={{flex:1, minWidth: '200px'}}>
                  <label className="label-text">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({...form, type: e.target.value})}
                    className="input-field"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                  </select>
                </div>
                <div style={{flex:1, minWidth: '200px'}}>
                  <label className="label-text">Category</label>
                  <input
                    type="text"
                    required
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{marginTop:'0.5rem'}}>
                <label style={{display:'flex', alignItems:'center', gap:'0.7rem', cursor:'pointer', userSelect:'none'}}>
                  <input
                    type="checkbox"
                    checked={lockCategoryEnabled}
                    onChange={(e) => setLockCategoryEnabled(e.target.checked)}
                    style={{width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary)'}}
                  />
                  <span style={{fontSize:'1rem', color:'var(--text-main)', fontWeight:'600'}}>
                    Lock this category (Protected)
                  </span>
                </label>

                {lockCategoryEnabled && (
                  <div style={{marginTop:'1.2rem'}}>
                    <label className="label-text">
                      Lock Password
                    </label>
                    <input
                      type="password"
                      value={lockCategoryPassword}
                      onChange={(e) => setLockCategoryPassword(e.target.value)}
                      placeholder={editing ? 'Leave blank to keep current password' : 'Enter password'}
                      className="input-field"
                    />
                  </div>
                )}
              </div>

              {form.type === 'pdf' ? (
                <>
                  <div style={{marginTop: '0.5rem'}}>
                    <label className="label-text">
                      PDF Upload
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                      className="input-field"
                      style={{padding: '0.75rem'}}
                    />
                    {pdfFile && (
                      <div style={{marginTop:'0.5rem', color:'var(--primary)', fontSize:'0.9rem', fontWeight: '500'}}>
                        Selected: {pdfFile.name}
                      </div>
                    )}
                  </div>

                  <div style={{marginTop: '0.5rem', position: 'relative'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                      <span style={{height: '1px', flex: 1, background: 'var(--border)'}}></span>
                      <span className="label-text" style={{margin: 0}}>OR PROVIDE URL</span>
                      <span style={{height: '1px', flex: 1, background: 'var(--border)'}}></span>
                    </div>
                    <input
                      type="url"
                      value={form.url}
                      onChange={(e) => setForm({...form, url: e.target.value})}
                      placeholder={editing ? 'Leave blank to keep existing URL' : 'Paste Drive share link / direct link'}
                      className="input-field"
                    />
                    <div style={{marginTop:'0.5rem', color:'var(--text-dim)', fontSize:'0.8rem', lineHeight: '1.4'}}>
                      Tip: Google Drive "anyone with link" share URL is supported.
                    </div>
                  </div>
                </>
              ) : (
                <div style={{marginTop: '0.5rem'}}>
                  <label className="label-text">
                    URL (video / link)
                  </label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm({...form, url: e.target.value})}
                    placeholder={editing ? 'Leave blank to keep existing URL' : 'https://...'}
                    className="input-field"
                  />
                </div>
              )}

              <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'2rem'}}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => { setShowForm(false); setEditing(null); setError(null); }}
                  style={{padding:'0.8rem 1.8rem'}}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{padding:'0.8rem 2rem'}}
                >
                  {saving ? 'Saving...' : (editing ? 'Update Resource' : 'Create Resource')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
