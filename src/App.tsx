import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"
import ServicesPage from "./pages/services/Services"
import CreateServicesPage from "./pages/services/CreateServices"
import EditServicesPage from "./pages/services/EditServices"
import FaqPage from "./pages/faq/FaqPage"
import CreateFaqPage from "./pages/faq/CreateFaqPage"
import BlogsPage from "./pages/blogs/BlogsPage"
import CreateBlogPage from "./pages/blogs/CreateBlogPage"
import CategoriesPage from "./pages/categories/CategoriesPage"
import CreateCategoryPage from "./pages/categories/CreateCategoryPage"

import SettingsPage from "./pages/Settings"

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/faq",
        element: <FaqPage/>,
      },
      {
        path: "/faq/create",
        element: <CreateFaqPage/>,
      },
      {
        path: "/blogs",
        element: <BlogsPage/>,
      },
      {
        path: "/blogs/create",
        element: <CreateBlogPage/>,
      },
      {
        path: "/categories",
        element: <CategoriesPage/>,
      },
      {
        path: "/categories/create",
        element: <CreateCategoryPage/>,
      },
      {
        path: "/services",
        element: <ServicesPage />,
      },
      {
        path: "/services/create",
        element: <CreateServicesPage />,
      },
      {
        path: "/services/edit/:id",
        element: <EditServicesPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])

function App() {


  return (
    
    <RouterProvider router={router} />
  )
}

export default App
