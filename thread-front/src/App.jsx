import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./components/Login.jsx";
import { Register } from "./components/Register.jsx";
import { Feed } from "./components/Feed.jsx";
import { CreatePost } from "./components/CreatePost.jsx";
import { PostDetails } from "./components/PostDetails.jsx";
import { Profile } from "./components/Profile.jsx";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/createPost" element={<CreatePost />} />
          <Route path="/post/:postId" element={<PostDetails />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;