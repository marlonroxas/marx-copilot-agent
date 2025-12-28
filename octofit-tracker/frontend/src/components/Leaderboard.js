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
                  data-bs-target="#modal-leaderboard"
                  onClick={() => onDetails(row)}
                >
                  Details
                </button>
                <button type="button" className="btn btn-sm btn-warning" data-bs-toggle="modal" data-bs-target="#edit-leaderboard-modal" onClick={() => { onEdit(row) }}>
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

export default function Leaderboard() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [createSaving, setCreateSaving] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState(null)
  const apiBase = (process.env.REACT_APP_API_BASE && process.env.REACT_APP_API_BASE.replace(/\/+$/,'')) ||
    (process.env.REACT_APP_CODESPACE_NAME ? `https://${process.env.REACT_APP_CODESPACE_NAME}-8000.app.github.dev` : '')
  const endpoint = `${apiBase}/api/leaderboard/`

  useEffect(() => {
    console.log('API base:', apiBase)
    console.log('Fetching Leaderboard from', endpoint)
    fetch(endpoint)
      .then((res) => res.json())
      .then((json) => {
        console.log('Leaderboard fetched:', json)
        const items = Array.isArray(json) ? json : json.results || []
        setData(items)
      })
      .catch((err) => console.error('Leaderboard fetch error:', err))
  }, [endpoint])

  return (
    <div>
      <h2 className="h5">Leaderboard</h2>
      <div className="mb-2 d-flex justify-content-end">
        <button className="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#create-leaderboard-modal">Create</button>
      </div>
      {renderTable(data, setSelected, setEditItem)}

      <div className="modal fade" id="create-leaderboard-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={async (e) => {
            e.preventDefault()
            const team = e.target.team.value
            const score = parseInt(e.target.score.value || 0, 10)
            if (!team) { setCreateError('Team is required'); return }
            setCreateSaving(true); setCreateError(null)
            try {
              const res = await fetch(endpoint, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({team, score})})
              if (!res.ok) {
                let errMsg = `Request failed: ${res.status}`
                try { const body = await res.json(); errMsg = body.detail || JSON.stringify(body) } catch(e){ try{ errMsg = await res.text() }catch(_){} }
                setCreateError(errMsg)
              } else {
                const json = await res.json()
                console.log('Created leaderboard entry', json)
                const el = document.getElementById('create-leaderboard-modal')
                const modal = window.bootstrap && window.bootstrap.Modal.getInstance(el)
                if (modal) modal.hide()
                fetch(endpoint).then(r=>r.json()).then(j=>setData(Array.isArray(j)?j:j.results||[]))
              }
            } catch(err){ setCreateError(String(err)) }
            setCreateSaving(false)
          }}>
            <div className="modal-header">
              <h5 className="modal-title">Create Leaderboard Entry</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {createError && <div className="alert alert-danger">{createError}</div>}
              <div className="mb-3"><label className="form-label">Team (id)</label><input name="team" className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Score</label><input name="score" type="number" className="form-control" /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createSaving}>{createSaving ? 'Creating...' : 'Create'}</button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="modal fade" id="edit-leaderboard-modal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <form key={editItem ? editItem.id : 'none'} className="modal-content" onSubmit={async (e) => {
            e.preventDefault(); if (!editItem) return
            const id = editItem.id || editItem.pk
            const team = e.target.team.value
            const score = parseInt(e.target.score.value||0,10)
            if (!team) { setEditError('Team is required'); return }
            setEditSaving(true); setEditError(null)
            try {
              const res = await fetch(`${endpoint}${id}/`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({team,score})})
              if (!res.ok) {
                let errMsg = `Request failed: ${res.status}`
                try { const body = await res.json(); errMsg = body.detail || JSON.stringify(body) } catch(e){ try{ errMsg = await res.text() }catch(_){} }
                setEditError(errMsg)
              } else {
                const json = await res.json(); console.log('Updated leaderboard', json)
                const el = document.getElementById('edit-leaderboard-modal')
                const modal = window.bootstrap && window.bootstrap.Modal.getInstance(el)
                if (modal) modal.hide()
                fetch(endpoint).then(r=>r.json()).then(j=>setData(Array.isArray(j)?j:j.results||[]))
              }
            } catch(err){ setEditError(String(err)) }
            setEditSaving(false)
          }}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Leaderboard Entry</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {editError && <div className="alert alert-danger">{editError}</div>}
              <div className="mb-3"><label className="form-label">Team (id)</label><input name="team" defaultValue={editItem?.team || editItem?.team?.id || ''} className="form-control" /></div>
              <div className="mb-3"><label className="form-label">Score</label><input name="score" type="number" defaultValue={editItem?.score||0} className="form-control" /></div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={editSaving}>{editSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="modal fade" id="modal-leaderboard" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Leaderboard details</h5>
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
    </div>
  )
}
