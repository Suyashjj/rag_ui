import { useEffect, useRef } from "react"
import { PanelLeftOpen } from "lucide-react"
import MessageBubble from "./MessageBubble"
import PromptInput from "./PromptInput"

export default function ChatArea({ sidebarOpen, onToggleSidebar, messages, onSend, isGenerating, onStop, isUploading }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isUploading])

    // 👇 DEBUG — remove after fixing
    console.log("isUploading:", isUploading, "| last msg files:", messages[messages.length - 1]?.files)

    return (
        <main style={{ background: "#0d0d0d", display: "flex", flexDirection: "column", height: "100%", flex: 1, minWidth: 0 }}>
            <header style={{ borderBottom: "1px solid #1e1e1e", padding: "12px 16px", display: "flex", alignItems: "center", flexShrink: 0 }}>
                {!sidebarOpen && (
                    <button onClick={onToggleSidebar}
                        style={{ marginRight: 12, padding: "6px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "#555" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "#555"}
                    >
                        <PanelLeftOpen size={16} />
                    </button>
                )}
                <span style={{ color: "#555", fontSize: 14, fontWeight: 500 }}>
                    {messages.length === 0 ? "New conversation" : "Chat"}
                </span>
            </header>

            <div style={{ flex: 1, overflowY: "auto" }}>
                {messages.length === 0 && !isUploading ? (
                    <EmptyState />
                ) : (
                    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px", display: "flex", flexDirection: "column", gap: "24px" }}>
                        {messages
                            .filter(msg => !(msg.role === "assistant" && !msg.text))
                            .map(msg => <MessageBubble key={msg.id} message={msg} />)
                        }
                        {isUploading && (
                            <FileUploadLoader fileName={messages[messages.length - 1]?.files?.[0]?.name} />
                        )}
                        {!isUploading && isGenerating && messages[messages.length - 1]?.role === "assistant" && !messages[messages.length - 1]?.text && (
                            <TypingIndicator />
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            <div style={{ flexShrink: 0, maxWidth: 860, margin: "0 auto", width: "100%" }}>
                <PromptInput onSend={onSend} isGenerating={isGenerating} onStop={onStop} isUploading={isUploading} />
            </div>
        </main>
    )
}

function FileUploadLoader({ fileName }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <style>{`
                @keyframes shimmer-sweep {
                    from { transform: translateX(-100%); }
                    to   { transform: translateX(250%); }
                }
                @keyframes bar-fill {
                    0%   { width: 0%; }
                    60%  { width: 80%; }
                    100% { width: 95%; }
                }
                @keyframes dot-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.3; transform: scale(0.6); }
                }
            `}</style>

            <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2
            }}>
                <span style={{ fontSize: 13 }}>⚡</span>
            </div>

            <div style={{
                background: "#1a1030",
                border: "1px solid #4a2fa0",
                borderRadius: "4px 18px 18px 18px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: 240,
                maxWidth: 320,
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.1), transparent)",
                    animation: "shimmer-sweep 1.8s infinite",
                    pointerEvents: "none"
                }} />

                <div style={{
                    width: 34, height: 40, borderRadius: 6,
                    background: "#1e1532", border: "1.5px solid #6233cc",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, position: "relative"
                }}>
                    <div style={{
                        position: "absolute", top: -1, right: -1,
                        width: 9, height: 9,
                        background: "#1a1030",
                        borderLeft: "1.5px solid #6233cc",
                        borderBottom: "1.5px solid #6233cc",
                        borderBottomLeftRadius: 3
                    }} />
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#a78bfa", fontFamily: "monospace" }}>PDF</span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: 12, color: "#c4b5fd", fontWeight: 500,
                        marginBottom: 6, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                        {fileName ?? "Uploading file…"}
                    </p>

                    <div style={{ height: 3, background: "#2a2a2a", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 99,
                            background: "linear-gradient(90deg, #6233cc, #a259ff)",
                            animation: "bar-fill 3s ease-out forwards"
                        }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                        <div style={{
                            width: 5, height: 5, borderRadius: "50%",
                            background: "#a78bfa",
                            animation: "dot-pulse 1.2s infinite ease-in-out"
                        }} />
                        <span style={{ fontSize: 10, color: "#6b7280" }}>Parsing document…</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, textAlign: "center", padding: "0 16px" }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, #7c3aed33, #4f46e533)", border: "1px solid #7c3aed44", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#ccc" }}>How can I help you?</h2>
            <p style={{ fontSize: 13, color: "#555", maxWidth: 280 }}>Ask anything, upload files, or start a new conversation.</p>
        </div>
    )
}

function TypingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <style>{`
                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background-color: #888;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                .typing-dot:nth-child(3) { animation-delay: 0s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>

            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <span style={{ fontSize: 13 }}>⚡</span>
            </div>

            <div style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "4px 18px 18px 18px", padding: "14px 16px", display: "flex", alignItems: "center", gap: 5, height: 44, boxSizing: "border-box" }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    )
}