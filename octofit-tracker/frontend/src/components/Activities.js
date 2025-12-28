import React, { useEffect, useState } from 'react'

function renderTable(data, onDetails, onEdit) {
  if (!data || data.length === 0) return <p>No items to display.</p>
  const first = data[0]
  const cols = Object.keys(first).filter((k) => typeof first[k] !== 'object')
  
  return (
    <div className="table-wrap">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c}>{c}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
            {data.map((row, i) => (
            <tr key={row.id || row.pk || i}>
              {cols.map((c) => (
                <td key={c}>{String(row[c] ?? '')}</td>
              ))}
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#modal-activities"
                  onClick={() => onDetails(row)}
                >
                  Details
                </button>
                <button type="button" className="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#edit-activity-modal" onClick={() => { onEdit(row) }}>
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Activities() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState(null)
    const apiBase = (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.replace(/\/+$/, '')) ||
      (process.env.REACT_APP_CODESPACE_NAME ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev` : '')
    const endpoint = `${apiBase}/api/activities/`

  useEffect(() => {
      console.log('API base:', apiBase)
      console.log('Fetching Activities from', endpoint)
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        console.log('Activities fetched:', json)
        const items = Array.isArray(json) ? json : json.results || []
        setData(items)
      })
      .catch((err) => console.error('Activities fetch error:', err))
  }, [endpoint])

  return (
    <div>
      <h2 className="h5">Activities</h2>
      <div className="mb-2 d-flex justify-content-end">
        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#create-activity-modal">Create</button>
      </div>

      <div className="modal fade" id="create-activity-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={async (e) => {
            e.preventDefault()
            const user = e.target.user.value
            const type = e.target.type.value
            const duration = parseInt(e.target.duration.value || 0, 10)
            const calories = parseInt(e.target.calories.value || 0, 10)
            if (!user || !type) { setCreateError('User and Type are required'); return }
            setCreateSaving(true); setCreateError(null)
            try {
              const res = await fetch(endpoint, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({user, type, duration, calories})})
              if (!res.ok) {
                let errMsg = `Request failed: ${res.status}`
                try { const body = await res.json(); errMsg = body.detail || JSON.stringify(body) } catch(e){ try{ errMsg = await res.text() }catch(_){} }
                setCreateError(errMsg)
              } else {
                const json = await res.json()
                console.log('Created activity', json)
                const el = document.getElementById('create-activity-modal')
                const modal = window.bootstrap && window.bootstrap.Modal.getInstance(el)
                if (modal) modal.hide()
                fetch(endpoint).then(r=>r.json()).then(j=>setData(Array.isArray(j)?j:j.results||[]))
              }
            } catch(err){ setCreateError(String(err)) }
            setCreateSaving(false)
          }}>
            <div className="modal-header">
              <h5 className="modal-title">Create Activity</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {createError && <div className="alert alert-danger">{createError}</div>}
              <div className="mb-3"><label className="form-label">User (id)</label><input name="user" className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Type</label><input name="type" className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Duration (minutes)</label><input name="duration" type="number" className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Calories</label><input name="calories" type="number" className="form-control" /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createSaving}>{createSaving ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
      {renderTable(data, setSelected, setEditItem)}

      <div className="modal fade" id="modal-activities" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Activity details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <pre className="small-json">{JSON.stringify(selected, null, 2)}</pre>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="modal fade" id="edit-activity-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <form key={editItem ? editItem.id : 'none'} className="modal-content" onSubmit={async (e) => {
            e.preventDefault(); if (!editItem) return
            const id = editItem?.id || editItem?.pk
            const user = e.target.user.value
            const type = e.target.type.value
            const duration = parseInt(e.target.duration.value||0,10)
            const calories = parseInt(e.target.calories.value||0,10)
            if (!user || !type) { setEditError('User and Type are required'); return }
            setEditSaving(true); setEditError(null)
            try {
              const res = await fetch(`${endpoint}${id}/`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({user,type,duration,calories})})
              if (!res.ok) {
                let errMsg = `Request failed: ${res.status}`
                try { const body = await res.json(); errMsg = body.detail || JSON.stringify(body) } catch(e){ try{ errMsg = await res.text() }catch(_){} }
                setEditError(errMsg)
              } else {
                const json = await res.json(); console.log('Updated activity', json)
                const el = document.getElementById('edit-activity-modal')
                const modal = window.bootstrap && window.bootstrap.Modal.getInstance(el)
                if (modal) modal.hide()
                fetch(endpoint).then(r=>r.json()).then(j=>setData(Array.isArray(j)?j:j.results||[]))
              }
            } catch(err){ setEditError(String(err)) }
            setEditSaving(false)
          }}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Activity</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {editError && <div className="alert alert-danger">{editError}</div>}
              <div className="mb-3"><label className="form-label">User (id)</label><input name="user" defaultValue={editItem?.user || editItem?.user?.id || ''} className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Type</label><input name="type" defaultValue={editItem?.type||''} className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Duration</label><input name="duration" type="number" defaultValue={editItem?.duration||0} className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Calories</label><input name="calories" type="number" defaultValue={editItem?.calories||0} className="form-control" /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
