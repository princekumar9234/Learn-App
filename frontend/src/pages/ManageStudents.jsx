import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const ManageStudents = () => {
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStudents = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get('/admin/students')
      setStudents(res.data.students || [])
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load students.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudents()
  }, [])

  const toggleBlockStudent = async (student) => {
    try {
      const res = await axios.post(`/admin/student/block/${student._id}`)
      const updated = res.data.student
      setStudents((prev) => prev.map((s) => (s._id === updated._id ? updated : s)))
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to update student status.')
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
        Manage Students
      </h1>

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
                <th style={{ padding: '1rem 1rem' }}>Name</th>
                <th style={{ padding: '1rem 1rem' }}>Email</th>
                <th style={{ padding: '1rem 1rem' }}>Status</th>
                <th style={{ padding: '1rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1rem', fontWeight: '700' }}>{s.name}</td>
                  <td style={{ padding: '1rem 1rem', color: 'var(--text-dim)' }}>{s.email}</td>
                  <td style={{ padding: '1rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.35rem 0.8rem',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        border: '1px solid var(--border)',
                        background: s.isBlocked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(34,197,94,0.10)',
                        color: s.isBlocked ? '#ef4444' : '#22c55e'
                      }}
                    >
                      {s.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1rem', textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '0.6rem 1.1rem', fontSize: '0.9rem' }}
                      onClick={() => toggleBlockStudent(s)}
                      type="button"
                    >
                      {s.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem 1rem', color: 'var(--text-dim)' }}>
                    No students registered yet.
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

export default ManageStudents

