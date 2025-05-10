import { useState } from 'react'
import { FloatButton, Drawer, Modal } from 'antd'
import KanjiForm from './components/KanjiForm'
import KanjiTable from './components/KanjiTable'

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [kanjiForm, setKanjiForm] = useState(false)

  return (
    <>




      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
      >
        <FloatButton
          description="Add"
          onClick={() => setKanjiForm((p) => !p)}
        />
        <FloatButton
          description="List"
          onClick={() => setDrawerOpen(true)}
        />
      </FloatButton.Group>
      <Modal
        title={`Add New Kanji`}
        open={kanjiForm}
        onCancel={() => setKanjiForm(false)}
        footer={null}>

        <KanjiForm />
      </Modal>

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
