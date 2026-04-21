import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom"
import { AuthLayout } from "./layouts/AuthLayout"
import { DashboardLayout } from "./layouts/DashboardLayout"
import { Dashboard } from "./pages/Dashboard"
import { Login } from "./pages/Login"
import ServicesPage from "./pages/services/Services"
import CreateServicesPage from "./pages/services/CreateServices"

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
        element: <div className="p-4 rounded border">Settings Page Placeholder</div>,
      },
      {
        path: "/services",
        element: <ServicesPage />,
      },
      {
        path: "/services/create",
        element: <CreateServicesPage />,
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
