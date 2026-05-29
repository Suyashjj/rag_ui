import { useState } from "react"
import { Search, Plus, Trash2, MessageSquare, Pencil, PanelLeftClose, BrainCircuit } from "lucide-react"

export default function Sidebar({ open, onToggle, conversations, activeId, onSelect, onDelete, onNew, onRename, isLoading }) {
    const [query, setQuery] = useState("")
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText] = useState("")

    const filtered = conversations.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase())
    )

    const startEdit = (e, c) => {
        e.stopPropagation()
        setEditingId(c.id)
        setEditText(c.title)
    }

    const commitEdit = (id) => {
        if (editText.trim()) onRename(id, editText.trim())
        setEditingId(null)
    }

    return (
        <>
            {/* Overlay backdrop — clicking it closes sidebar */}
            {open && (
                <div
                    onClick={onToggle}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        zIndex: 99,
                        backdropFilter: "blur(1px)",
                    }}
                />
            )}

            {/* Sidebar drawer */}
            <aside style={{
                position: "fixed",
                top: 0, left: 0,
                height: "100vh",
                width: "260px",
                background: "#111111",
                borderRight: "1px solid #1e1e1e",
                display: "flex",
                flexDirection: "column",
                zIndex: 100,
                transform: open ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease",
            }}>
                {/* Header */}
                <div style={{ borderBottom: "1px solid #1e1e1e", padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <button
                            onClick={onToggle}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                background: "transparent", border: "none", cursor: "pointer",
                                padding: "2px 6px 2px 0", borderRadius: 8,
                            }}
                            title="Close sidebar"
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                        >
                            <div style={{
                                width: 30, height: 30, borderRadius: 9,
                                background: "#1e1e1e",
                                border: "1px solid #2e2e2e",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0
                            }}>
                                <BrainCircuit size={15} color="#888" />
                            </div>
                            <span style={{ color: "#d0d0d0", fontWeight: 600, fontSize: 15, letterSpacing: "0.04em" }}>c-net</span>
                            <PanelLeftClose size={14} color="#444" style={{ marginLeft: 2 }} />
                        </button>

                        <button onClick={onNew} style={{
                            width: 28, height: 28, borderRadius: 8, background: "#1a1a1a",
                            border: "1px solid #2a2a2a", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer", color: "#666"
                        }}
                            onMouseEnter={e => { e.currentTarget.style.background = "#242424"; e.currentTarget.style.color = "#bbb" }}
                            onMouseLeave={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#666" }}
                        >
                            <Plus size={15} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div style={{ padding: "12px 12px 8px" }}>
                    <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#161616", border: "1px solid #252525",
                        borderRadius: 10, padding: "8px 12px"
                    }}>
                        <Search size={13} color="#555" style={{ flexShrink: 0 }} />
                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search chats..."
                            style={{
                                background: "transparent", border: "none", outline: "none",
                                color: "#aaa", fontSize: 13, width: "100%", fontFamily: "inherit"
                            }}
                        />
                    </div>
                </div>

                {/* Section label */}
                <div style={{ padding: "4px 16px 6px" }}>
                    <span style={{ fontSize: 11, color: "#4a4a4a", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                        Recent
                    </span>
                </div>

                {/* Chat List */}
                <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
                    {isLoading && (
                        <>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{
                                    padding: "9px 10px", borderRadius: 9,
                                    background: "#161616", border: "1px solid transparent",
                                    display: "flex", alignItems: "center", gap: 9
                                }}>
                                    <div style={{ width: 13, height: 13, borderRadius: 3, background: "#242424", flexShrink: 0 }} />
                                    <div style={{
                                        height: 10, borderRadius: 4, background: "#242424",
                                        width: `${55 + i * 15}%`,
                                        animation: "pulse 1.5s ease-in-out infinite"
                                    }} />
                                </div>
                            ))}
                            <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
                        </>
                    )}

                    {!isLoading && filtered.length === 0 && (
                        <p style={{ color: "#484848", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No chats found</p>
                    )}

                    {!isLoading && filtered.map(c => (
                        <div key={c.id}
                            onClick={() => { if (editingId !== c.id) onSelect(c.id) }}
                            style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "9px 10px", borderRadius: 9, cursor: "pointer",
                                background: c.id === activeId ? "#1c1c1c" : "transparent",
                                border: c.id === activeId ? "1px solid #272727" : "1px solid transparent",
                                borderLeft: c.id === activeId ? "2px solid #555" : "1px solid transparent",
                                transition: "all 0.15s"
                            }}
                            onMouseEnter={e => { if (c.id !== activeId) e.currentTarget.style.background = "#161616" }}
                            onMouseLeave={e => { if (c.id !== activeId) e.currentTarget.style.background = "transparent" }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1 }}>
                                <MessageSquare size={13} color={c.id === activeId ? "#777" : "#333"} style={{ flexShrink: 0 }} />
                                {editingId === c.id ? (
                                    <input
                                        autoFocus value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        onBlur={() => commitEdit(c.id)}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") commitEdit(c.id)
                                            if (e.key === "Escape") setEditingId(null)
                                        }}
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            background: "#222", border: "1px solid #333", borderRadius: 5,
                                            color: "#ccc", fontSize: 12, padding: "2px 6px", outline: "none",
                                            width: "100%", fontFamily: "inherit"
                                        }}
                                    />
                                ) : (
                                    <span style={{
                                        fontSize: 14,
                                        color: c.id === activeId ? "#e0e0e0" : "#666",
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                                    }}>
                                        {c.title}
                                    </span>
                                )}
                            </div>

                            {editingId !== c.id && (
                                <div style={{ display: "flex", gap: 2, flexShrink: 0, marginLeft: 4, opacity: 0 }}
                                    ref={el => {
                                        if (el) {
                                            const parent = el.parentElement
                                            parent.addEventListener("mouseenter", () => el.style.opacity = "1")
                                            parent.addEventListener("mouseleave", () => el.style.opacity = "0")
                                        }
                                    }}
                                >
                                    <button onClick={e => startEdit(e, c)}
                                        style={{ width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.color = "#999" }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444" }}
                                    >
                                        <Pencil size={11} />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); onDelete(c.id) }}
                                        style={{ width: 24, height: 24, borderRadius: 6, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#444" }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "#222"; e.currentTarget.style.color = "#f87171" }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#444" }}
                                    >
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    )
}