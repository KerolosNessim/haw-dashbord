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
import EditFaqPage from "./pages/faq/EditFaqPage"
import BlogsPage from "./pages/blogs/BlogsPage"
import CreateBlogPage from "./pages/blogs/CreateBlogPage"
import EditBlogPage from "./pages/blogs/EditBlogPage"
import BlogCategoriesPage from "./pages/blog-categories/BlogCategoriesPage"
import CreateBlogCategoryPage from "./pages/blog-categories/CreateBlogCategoryPage"
import EditBlogCategoryPage from "./pages/blog-categories/EditBlogCategoryPage"
import CategoriesPage from "./pages/categories/CategoriesPage"
import CreateCategoryPage from "./pages/categories/CreateCategoryPage"

import SettingsPage from "./pages/Settings"
import HomeContentPage from "./pages/home-content/HomeContentPage"
import WhyChooseUsPage from "./pages/why-choose-us/WhyChooseUsPage"
import SolutionCategoriesPage from "./pages/solutions/SolutionCategoriesPage"
import SolutionSinglesPage from "./pages/solutions/SolutionSinglesPage"
import CreateSolutionSinglePage from "./pages/solutions/CreateSolutionSinglePage"
import EditSolutionSinglePage from "./pages/solutions/EditSolutionSinglePage"
import SolutionsPage from "./pages/solutions/SolutionsPage"
import HelpYouPage from "./pages/help-you/HelpYouPage"
import TestimonialsPage from "./pages/testimonials/TestimonialsPage"
import AboutUsPage from "./pages/about/AboutUsPage"
import PackageCategoriesPage from "./pages/package-categories/PackageCategoriesPage"
import CreatePackageCategoryPage from "./pages/package-categories/CreatePackageCategoryPage"
import EditPackageCategoryPage from "./pages/package-categories/EditPackageCategoryPage"
import PackagesPage from "./pages/packages/PackagesPage"
import CreatePackagePage from "./pages/packages/CreatePackagePage"
import EditPackagePage from "./pages/packages/EditPackagePage"
import CoursesPage from "./pages/courses/CoursesPage"
import CreateCoursePage from "./pages/courses/CreateCoursePage"
import EditCoursePage from "./pages/courses/EditCoursePage"
import CountriesPage from "./pages/countreies/CountriesPage"

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
        path: "/home-content",
        element: <HomeContentPage />,
      },
      {
        path: "/why-choose-us",
        element: <WhyChooseUsPage />,
      },
      {
        path: "/solutions",
        element: <SolutionsPage />,
      },
      {
        path: "/solution-singles",
        element: <SolutionSinglesPage />,
      },
      {
        path: "/solution-singles/create",
        element: <CreateSolutionSinglePage />,
      },
      {
        path: "/solution-singles/edit/:id",
        element: <EditSolutionSinglePage />,
      },
      {
        path: "/solution-categories",
        element: <SolutionCategoriesPage />,
      },
      {
        path: "/help-you",
        element: <HelpYouPage />,
      },
      {
        path: "/countries",
        element: <CountriesPage />,
      },
      {
        path: "/package-categories",
        element: <PackageCategoriesPage />,
      },
      {
        path: "/package-categories/create",
        element: <CreatePackageCategoryPage />,
      },
      {
        path: "/package-categories/edit/:id",
        element: <EditPackageCategoryPage />,
      },
      {
        path: "/packages",
        element: <PackagesPage />,
      },
      {
        path: "/packages/create",
        element: <CreatePackagePage />,
      },
      {
        path: "/packages/edit/:id",
        element: <EditPackagePage />,
      },
      {
        path: "/courses",
        element: <CoursesPage />,
      },
      {
        path: "/courses/create",
        element: <CreateCoursePage />,
      },
      {
        path: "/courses/edit/:id",
        element: <EditCoursePage />,
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
        path: "/faq/edit/:id",
        element: <EditFaqPage/>,
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
        path: "/blogs/edit/:id",
        element: <EditBlogPage/>,
      },
      {
        path: "/blog-categories",
        element: <BlogCategoriesPage />,
      },
      {
        path: "/blog-categories/create",
        element: <CreateBlogCategoryPage />,
      },
      {
        path: "/blog-categories/edit/:id",
        element: <EditBlogCategoryPage />,
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
      {
        path: "/testimonials",
        element: <TestimonialsPage />,
      },
      {
        path: "/about",
        element: <AboutUsPage />,
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
