import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

const MainOutlet = () => {
  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex">
      {/* Fixed OpenStatus Sidebar */}
      <Sidebar />

      {/* Main Content Area offset by Sidebar width */}
      <main className="flex-1 ml-[240px] min-w-0 min-h-screen bg-[#000000] flex flex-col relative overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  )
}

export default MainOutlet
