import { useState } from 'react'
import { FloatButton, Drawer, Modal, Avatar, Button } from 'antd'
import KanjiTable from './components/KanjiTable'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import Login from './components/Login';
import DeckModal from './components/DeckModal';
import { useAuthStore } from './stores/authStore';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loginModal, setLoginModal] = useState(false);
  const [deckModal, setDeckModal] = useState(false);
  const navigate = useNavigate()
  const { isAuthenticated, username, isGuest, clearAuth } = useAuthStore()

  const handleLogout = () => {
    clearAuth()
    setLoginModal(false)
  }

  const handleAvatarClick = () => {
    if (isAuthenticated && !isGuest) {
      return
    }
    setLoginModal(true)
  }

  return (
    <>
      <div className='z-50 absolute top-0 right-0 flex items-center gap-2 p-4'>
        {isAuthenticated && !isGuest && (
          <>
            <span className="text-sm font-medium text-gray-700">
              {username}
            </span>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="small"
            />
          </>
        )}
        <div onClick={handleAvatarClick} className='cursor-pointer'>
          <Avatar
            style={{ backgroundColor: isAuthenticated && !isGuest ? '#52c41a' : 'white' }}
            size={64}
            icon={<UserOutlined style={{ color: isAuthenticated && !isGuest ? 'white' : '#08c' }} />}
          />
        </div>
      </div>

      <Modal
        open={loginModal}
        onCancel={() => setLoginModal(false)}
        footer={null}>
        <Login onSuccess={() => setLoginModal(false)} />
      </Modal>

      <Modal
        open={deckModal}
        onCancel={() => setDeckModal(false)}
        footer={null}>
        <DeckModal />
      </Modal>

      <div className="fixed flex gap-4 flex-col inset-0 flex justify-center items-center z-10">
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          onClick={() => navigate('/flashcards')}
        >
          Go to Flashcards
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition"
          onClick={() => setDeckModal(true)}
        >
          Decks
        </button>
        <button
          className="bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 transition"
          onClick={() => navigate('/debug')}
        >
          🐛 Debug Question
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