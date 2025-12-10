import { useState } from 'react'

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Feed from './components/Feed.jsx'
import { Register } from './components/Register.jsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/register" element={<Register />} />

        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
