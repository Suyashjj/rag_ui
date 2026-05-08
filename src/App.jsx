import { useState } from "react"
import Sidebar from "./components/Sidebar"
import ChatArea from "./components/ChatArea"
import { useChat } from "./hooks/useChat"

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const chat = useChat()

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0d0d", color: "white", overflow: "hidden" }}>
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.selectConversation}
        onDelete={chat.deleteConversation}
        onNew={chat.newConversation}
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
        isUploading={chat.isUploading} /* 👈 ADD THIS LINE HERE */
      />
    </div>
  )
}