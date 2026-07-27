import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Lock, Unlock, Save, Pencil, Plus } from 'lucide-react'

const ManageAccess = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [passwordById, setPasswordById] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryProtected, setNewCategoryProtected] = useState(false)
  const [newCategoryPassword, setNewCategoryPassword] = useState('')
  const [addingCategory, setAddingCategory] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('/admin/categories')
      const cats = res.data.categories || []
      setCategories(cats)

      const next = {}
      cats.forEach((c) => {
        next[c._id] = c.password || ''
      })
      setPasswordById(next)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const updateCategoryPassword = async (category) => {
    setSaving(true)
    setError(null)
    try {
      const password = (passwordById[category._id] ?? '').trim()
      await axios.post('/admin/categories/update-password', {
        categoryId: category._id,
        password: password
      })
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update lock password.')
    } finally {
      setSaving(false)
    }
  }

  const renameOrMerge = async (category) => {
    const newName = window.prompt(`Rename / Merge "${category.name}" to new name`)
    if (!newName) return

    setSaving(true)
    setError(null)
    try {
      await axios.post('/admin/categories/rename', {
        categoryId: category._id,
        newName: newName.trim()
      })
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to rename category.')
    } finally {
      setSaving(false)
    }
  }

  const addCategory = async (e) => {
    e.preventDefault()
    setAddingCategory(true)
    setError(null)
    try {
      const name = newCategoryName.trim()
      if (!name) throw new Error('Category name is required')

      const password = newCategoryProtected ? newCategoryPassword.trim() : ''
      if (newCategoryProtected && !password) throw new Error('Password required for Protected category')

      await axios.post('/admin/categories/create', {
        name,
        password: password
      })

      // Reset and refresh
      setNewCategoryName('')
      setNewCategoryProtected(false)
      setNewCategoryPassword('')
      await loadCategories()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to add category.')
    } finally {
      setAddingCategory(false)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={18} style={{ color: 'var(--text-dim)' }} />
        <button
          className="btn btn-ghost"
          style={{ padding: '0.6rem 1rem', fontSize: '0.9rem' }}
          onClick={() => navigate('/admin/dashboard')}
          type="button"
        >
          Back to Admin
        </button>
      </div>

      <h1 className="heading" style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1.5rem' }}>
        Manage Access
      </h1>
      <p style={{ color: 'var(--text-dim)', marginBottom: '2rem' }}>
        Public = no password. Protected = students need password to unlock.
      </p>

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Plus size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Add Category</h2>
        </div>

        <form onSubmit={addCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="label-text">
              Category Name
            </label>
            <input
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="input-field"
              placeholder="Example: HTML, CSS, Node.js"
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={newCategoryProtected} onChange={(e) => setNewCategoryProtected(e.target.checked)} />
            <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Protected (Locked)</span>
          </label>

          {newCategoryProtected && (
            <div>
              <label className="label-text">
                Lock Password
              </label>
              <input
                type="password"
                required
                value={newCategoryPassword}
                onChange={(e) => setNewCategoryPassword(e.target.value)}
                className="input-field"
                placeholder="Enter password"
              />
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '0.8rem 1.3rem' }}
              onClick={() => {
                setNewCategoryName('')
                setNewCategoryProtected(false)
                setNewCategoryPassword('')
              }}
              disabled={addingCategory}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 1.6rem' }} disabled={addingCategory}>
              {addingCategory ? 'Adding...' : 'Add Category'}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '0.8rem',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444'
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ paddingTop: '2rem', color: 'var(--text-dim)' }}>Loading...</div>
      ) : (
        <div className="glass-card" style={{ padding: '2.2rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  color: 'var(--text-dim)',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  letterSpacing: '0.08em'
                }}
              >
                <th style={{ padding: '1rem 1rem' }}>Category Name</th>
                <th style={{ padding: '1rem 1rem' }}>Status</th>
                <th style={{ padding: '1rem 1rem' }}>Password</th>
                <th style={{ padding: '1rem 1rem' }}>Rename / Merge</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const isProtected = !!c.password
                const value = passwordById[c._id] ?? ''
                return (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1rem', fontWeight: '700' }}>{c.name}</td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          border: '1px solid var(--border)',
                          background: isProtected ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.10)',
                          color: isProtected ? '#ef4444' : '#22c55e'
                        }}
                      >
                        {isProtected ? <Lock size={16} /> : <Unlock size={16} />}
                        {isProtected ? 'Protected' : 'Public'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={value}
                          placeholder={isProtected ? '' : 'No password set'}
                          onChange={(e) => setPasswordById((prev) => ({ ...prev, [c._id]: e.target.value }))}
                          className="input-field"
                          style={{
                            flex: 1,
                            padding: '0.75rem 0.95rem'
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.7rem 1rem', minWidth: '88px', justifyContent: 'center' }}
                          onClick={() => updateCategoryPassword(c)}
                          disabled={saving}
                        >
                          <Save size={16} /> Save
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        style={{ padding: '0.7rem 1rem', justifyContent: 'center' }}
                        onClick={() => renameOrMerge(c)}
                        disabled={saving}
                      >
                        <Pencil size={16} /> Rename
                      </button>
                    </td>
                  </tr>
                )
              })}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem 1rem', color: 'var(--text-dim)' }}>
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageAccess

