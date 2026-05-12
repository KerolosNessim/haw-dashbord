import { Navigate } from "react-router-dom";

/** Legacy route: `/solutions` → table CRUD page. */
export default function SolutionsPage() {
  return <Navigate to="/solution-singles" replace />;
}
