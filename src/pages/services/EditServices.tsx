import { useParams } from "react-router-dom";

export default function EditServicesPage() {
  const { id } = useParams();
  console.log("Service ID:", id);
  return (
    <div>EditServicesPage {id}</div>
  )
}
