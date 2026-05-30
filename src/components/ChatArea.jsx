import { useEffect, useRef } from "react"
import { PanelLeftOpen, Sparkles } from "lucide-react"
import MessageBubble from "./MessageBubble"
import PromptInput from "./PromptInput"

export default function ChatArea({ sidebarOpen, onToggleSidebar, messages, onSend, isGenerating, onStop, isUploading }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isUploading])

    // Filter once so indices match between rendering and "isLast" detection
    const visibleMessages = messages.filter(msg => !(msg.role === "assistant" && !msg.text))

    return (
        <main style={{
            background: "#141414",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: 1,
            minWidth: 0
        }}>
            <header style={{
                borderBottom: "1px solid #1e1e1e",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                flexShrink: 0
            }}>
                {!sidebarOpen && (
                    <button onClick={onToggleSidebar}
                        style={{
                            marginRight: 12,
                            padding: "6px",
                            borderRadius: 6,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#444"
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "#aaa"}
                        onMouseLeave={e => e.currentTarget.style.color = "#444"}
                    >
                        <PanelLeftOpen size={16} />
                    </button>
                )}
                <span style={{ color: "#888", fontSize: 14, fontWeight: 500 }}>
                    {messages.length === 0 ? "New conversation" : "Chat"}
                </span>
            </header>

            {/* ✅ Scrollable messages area */}
            <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
                {messages.length === 0 && !isUploading ? (
                    <EmptyState />
                ) : (
                    <div style={{
                        width: "100%",
                        maxWidth: 860,
                        margin: "0 auto",
                        padding: "24px 12px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px"
                    }}>
                        {visibleMessages.map((msg, i) => {
                            const isLast = i === visibleMessages.length - 1
                            const isStreaming =
                                isGenerating &&
                                isLast &&
                                msg.role === "assistant"
                            return (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    isStreaming={isStreaming}
                                />
                            )
                        })}
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

            {/* ✅ PromptInput wrapper */}
            <div style={{
                flexShrink: 0,
                width: "100%",
                maxWidth: 860,
                margin: "0 auto",
                boxSizing: "border-box"
            }}>
                <PromptInput
                    onSend={onSend}
                    isGenerating={isGenerating}
                    onStop={onStop}
                    isUploading={isUploading}
                />
            </div>
        </main>
    )
}

function SparkleAvatar() {
    return (
        <>
            <style>{`
                @keyframes sparkle-spin {
                    0%   { transform: rotate(0deg) scale(1);    opacity: 0.9; }
                    50%  { transform: rotate(180deg) scale(1.15); opacity: 1; }
                    100% { transform: rotate(360deg) scale(1);   opacity: 0.9; }
                }
                .sparkle-icon { animation: sparkle-spin 3s linear infinite; }
            `}</style>
            <div style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "#1e1e1e", border: "1px solid #2e2e2e",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 2
            }}>
                <Sparkles className="sparkle-icon" size={13} color="#777" />
            </div>
        </>
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

            <SparkleAvatar />

            <div style={{
                background: "#181818", border: "1px solid #2a2a2a",
                borderRadius: "4px 18px 18px 18px",
                padding: "12px 16px", display: "flex", alignItems: "center", gap: 10,
                flex: 1,
                maxWidth: 320,
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)",
                    animation: "shimmer-sweep 2s infinite", pointerEvents: "none"
                }} />
                <div style={{
                    width: 34, height: 40, borderRadius: 6,
                    background: "#1e1e1e", border: "1px solid #2a2a2a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, position: "relative"
                }}>
                    <div style={{
                        position: "absolute", top: -1, right: -1, width: 9, height: 9,
                        background: "#181818", borderLeft: "1px solid #2a2a2a",
                        borderBottom: "1px solid #2a2a2a", borderBottomLeftRadius: 3
                    }} />
                    <span style={{ fontSize: 8, fontWeight: 700, color: "#666", fontFamily: "monospace" }}>PDF</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                        fontSize: 12, color: "#888", fontWeight: 500,
                        marginBottom: 6, whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis"
                    }}>
                        {fileName ?? "Uploading file…"}
                    </p>
                    <div style={{ height: 2, background: "#222", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 99,
                            background: "#444",
                            animation: "bar-fill 3s ease-out forwards"
                        }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                        <div style={{
                            width: 4, height: 4, borderRadius: "50%", background: "#555",
                            animation: "dot-pulse 1.2s infinite ease-in-out"
                        }} />
                        <span style={{ fontSize: 10, color: "#555" }}>Parsing document…</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmptyState() {
    return (
        <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            height: "100%", gap: 12, textAlign: "center",
            padding: "0 16px"
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "#1a1a1a", border: "1px solid #252525",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8
            }}>
                <Sparkles size={22} color="#555" />
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "#d0d0d0" }}>How can I help you?</h2>
            <p style={{ fontSize: 13, color: "#606060", maxWidth: 280 }}>
                Ask anything, upload files, or start a new conversation.
            </p>
        </div>
    )
}

function TypingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <style>{`
                .typing-dot {
                    width: 5px; height: 5px; background: #444;
                    border-radius: 50%;
                    animation: bounce 1.4s infinite ease-in-out both;
                }
                .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                .typing-dot:nth-child(3) { animation-delay: 0s; }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
                    40% { transform: scale(1); opacity: 1; }
                }
            `}</style>
            <SparkleAvatar />
            <div style={{
                background: "#1a1a1a", border: "1px solid #222",
                borderRadius: "4px 18px 18px 18px",
                padding: "14px 16px", display: "flex", alignItems: "center", gap: 5,
                height: 44, boxSizing: "border-box"
            }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
            </div>
        </div>
    )
}
