// src/router.jsx
import { createBrowserRouter } from "react-router-dom";
import PracticeMainLayout from "../layouts/PracticeMainLayout";
import MainLayout from "../layouts/MainLayout";
import DashboardPage from "../pages/DashboardPage";
import ProductsPage from "../pages/ProductsPage";
import PracticePage from "../pages/PracticePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
    ],
  },
  {
    path: "/practice",
    element: <PracticeMainLayout />,
    children: [
      {
        path: ":concept",
        element: <PracticePage />,  // This is what was missing
      },
      {
        index: true,  // For when just /practice is visited
        element: <PracticePage />,
      },
    ],
  },
  {
    path: "*",
    element: <DashboardPage />,
  }
]);

export default router;