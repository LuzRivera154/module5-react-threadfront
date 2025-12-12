import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CreatePost } from './components/CreatePost.jsx'
import Feed from './components/Feed.jsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path='/home' element={<Feed />} />
          <Route path="/createPost" element={<CreatePost />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
