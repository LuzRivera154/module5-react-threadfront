import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CreatePost } from './components/CreatePost.jsx'
import Feed from './components/Feed.jsx'
import { Register } from './components/Register.jsx'
import { Login } from "./components/Login.jsx";
import { Profile } from "./components/Profile.jsx"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path='/home' element={<Feed />} />
          <Route path="/createPost" element={<CreatePost />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
