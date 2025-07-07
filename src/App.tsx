import { useState } from 'react'
import { FloatButton, Drawer, Modal, Avatar } from 'antd'
import KanjiForm from './components/KanjiForm'
import KanjiTable from './components/KanjiTable'
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import Login from './components/Login';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  //const [kanjiForm, setKanjiForm] = useState(false)
  const [loginModal, setLoginModal] = useState(false);
  const navigate = useNavigate()

  return (
    <>
      <div onClick={() => setLoginModal(p => !p)} className=' z-50 absolute top-0 right-0 cursor-pointer'>
        <Avatar style={{ backgroundColor: 'white' }} size={64} icon={<UserOutlined style={{ color: '#08c' }} />} />
      </div>
      <Modal
        open={loginModal}
        onCancel={() => setLoginModal(false)}
        footer={null}>
        <Login />
      </Modal>
      <div className="fixed inset-0 flex justify-center items-center z-10">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          onClick={() => navigate('/flashcards')}
        >
          Go to Flashcards
        </button>
      </div>

      <FloatButton.Group trigger="hover" type="primary" style={{ right: 24, bottom: 24 }}>

        <FloatButton description="List" onClick={() => setDrawerOpen(true)} />
      </FloatButton.Group>





      <Drawer
        title="Kanji List"
        placement="bottom"
        height="90%"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <KanjiTable />
      </Drawer>
    </>
  )
}

export default App
/*

 <FloatButton description="Add" onClick={() => setKanjiForm((p) => !p)} />
<Modal
        title="Add New Kanji"
        open={kanjiForm}
        onCancel={() => setKanjiForm(false)}
        footer={null}
      >
        <KanjiForm />
      </Modal>

*/