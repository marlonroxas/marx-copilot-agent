import React from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Activities from './components/Activities'
import Leaderboard from './components/Leaderboard'
import Teams from './components/Teams'
import Users from './components/Users'
import Workouts from './components/Workouts'
import './App.css'

function Home() {
  return <p>Welcome to OctoFit Tracker</p>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="container py-4">
        <header className="app-header">
          <img src="/octofitapp-small.svg" alt="OctoFit" />
          <h1 className="h3">OctoFit Tracker</h1>
        </header>

        <nav className="mb-4">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <NavLink to="/" className="nav-link" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/activities" className="nav-link">
                Activities
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/workouts" className="nav-link">
                Workouts
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/teams" className="nav-link">
                Teams
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/users" className="nav-link">
                Users
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/leaderboard" className="nav-link">
                Leaderboard
              </NavLink>
            </li>
          </ul>
        </nav>

        <main>
          <div className="app-card card">
            <div className="card-body">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/workouts" element={<Workouts />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/users" element={<Users />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </div>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
