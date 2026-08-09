import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import PublicPostList from "./pages/PublicPostList.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import AdminPostList from "./pages/AdminPostList.jsx";
import PostForm from "./pages/PostForm.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<PublicPostList />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/admin" element={<AdminPostList />} />
          <Route path="/admin/posts/new" element={<PostForm />} />
          <Route path="/admin/posts/:id/edit" element={<PostForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}
