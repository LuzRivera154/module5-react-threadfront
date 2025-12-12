import { useState } from 'react'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Feed from './components/Feed.jsx'
import { Register } from './components/Register.jsx'

import { Login } from "./components/Login.jsx";



function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/register" element={<Register />} />

          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
