import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DeliveryHub – Captain Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}


// import type { Metadata } from "next";
// import Sidebar from "@/modules/captain/ui/Sidebar";

// export const metadata: Metadata = {
//   title: "DeliveryHub – Captain Dashboard",
// };

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="flex min-h-screen bg-[#0F172A]">
//       {/* Captain Sidebar */}
//       <Sidebar />

//       {/* Main content */}
//       <main className="flex-1 w-full overflow-hidden">
//         {children}
//       </main>
//     </div>
//   );
// }