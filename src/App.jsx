import { useState, useEffect } from "react"
import Sidebar from "./components/Sidebar"
import ChatArea from "./components/ChatArea"
import { useChat } from "./hooks/useChat"

export default function App() {
  // ✅ Fix: sidebar closed by default on mobile
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const chat = useChat()

  // ✅ Fix: close sidebar on mobile when window resizes down
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      // ✅ Fix: prevent body scroll on mobile
      height: "100dvh",
      background: "#0d0d0d",
      color: "white",
      overflow: "hidden"
    }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={(id) => {
          chat.selectConversation(id)
          // ✅ Fix: auto close sidebar on mobile after selecting
          if (window.innerWidth < 768) setSidebarOpen(false)
        }}
        onDelete={chat.deleteConversation}
        onNew={() => {
          chat.newConversation()
          if (window.innerWidth < 768) setSidebarOpen(false)
        }}
        onRename={chat.renameConversation}
        isLoading={chat.isLoadingSessions}
      />
      <ChatArea
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        messages={chat.activeMessages}
        onSend={chat.sendMessage}
        isGenerating={chat.isGenerating}
        onStop={chat.stopGeneration}
        isUploading={chat.isUploading}
      />
    </div>
  )
}
