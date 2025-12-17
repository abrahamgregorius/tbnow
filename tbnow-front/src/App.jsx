import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Chat from './pages/Chat'
import Analyze from './pages/Analyze'
import Records from './pages/Records'

function App() {
  return (
    <Routes>
      <Route element={<Landing></Landing>} path='/'></Route>
      <Route element={<Home></Home>} path='/home'></Route>
      <Route element={<Chat></Chat>} path='/chat'></Route>
      <Route element={<Analyze></Analyze>} path='/analyze'></Route>
      <Route element={<Records></Records>} path='/records'></Route>
    </Routes>
  )
}


export default App

