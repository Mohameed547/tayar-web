
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}



// import ProviderDashboard from '@/components/ProviderDashboard'

// export default function Home() {
//   return <ProviderDashboard />
// }