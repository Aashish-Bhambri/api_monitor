import { Outlet } from 'react-router'
import Sidebar from './Sidebar'

const MainOutlet = () => {
  return (
    <div className='flex'>
        <Sidebar/>

        <Outlet/>
    </div>
  )
}

export default MainOutlet