import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Listing from "./pages/Listing";
import ArticlePage from "./pages/ArticlePage";
import Login from "./pages/Login";
import { Notice } from "./components/ui";

export default function App() {
  return (
    <Routes>
      <Route path="login" element={<Login mode="login" />} />
      <Route path="register" element={<Login mode="register" />} />
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="category/:slug" element={<Listing mode="category" />} />
        <Route path="search" element={<Listing mode="search" />} />
        <Route path="article/:id" element={<ArticlePage />} />
        <Route
          path="*"
          element={
            <Notice title="Page not found">
              Check the address or go back to the homepage.
            </Notice>
          }
        />
      </Route>
    </Routes>
  );
}
