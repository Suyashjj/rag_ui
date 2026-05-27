import { useRef, useState, useEffect, useCallback } from "react"
import { Send, Plus, Square, X, FileText, Loader2 } from "lucide-react"

export default function PromptInput({ onSend, isGenerating, onStop, isUploading }) {
    const [text, setText] = useState("")
    const [files, setFiles] = useState([])
    const [dragging, setDragging] = useState(false)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = "auto"
        el.style.height = Math.min(el.scrollHeight, 240) + "px"
    }, [text])

    const handleFiles = useCallback((incoming) => {
        const mapped = Array.from(incoming).map(f => ({
            file: f,
            name: f.name, type: f.type, size: f.size,
            url: f.type.startsWith("image/") ? URL.createObjectURL(f) : null
        }))
        setFiles(prev => [...prev, ...mapped])
    }, [])

    const handleSend = () => {
        if (!text.trim() && files.length === 0) return
        onSend({ text: text.trim(), files })
        setText("")
        setFiles([])
    }

    const handleKeyDown = e => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            if (canSend) handleSend()
        }
    }

    const canSend = (text.trim() || files.length > 0) && !isUploading && !isGenerating

    // ✅ FIX: block the entire input box during generating OR uploading
    const isLocked = isUploading || isGenerating

    return (
        <div style={{ padding: "16px 24px 32px" }}>
            <style>
                {`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                    textarea::placeholder { color: #555; }
                `}
            </style>

            <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}
                style={{
                    background: "#161616",
                    border: `1.5px solid ${dragging ? "#7c3aed" : "#2e2e2e"}`,
                    borderRadius: 18,
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    boxShadow: dragging ? "0 0 0 3px rgba(124,58,237,0.15)" : "0 2px 20px rgba(0,0,0,0.4)",
                    opacity: isLocked ? 0.6 : 1,
                    // ✅ FIX: pointerEvents none on whole box when locked —
                    // EXCEPT we need the stop button clickable when generating
                    // so we only hard-lock on uploading; generating uses disabled on textarea only
                    pointerEvents: isUploading ? "none" : "auto"
                }}
            >
                {/* File previews */}
                {files.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "12px 14px 4px" }}>
                        {files.map((f, i) => (
                            <div key={i} style={{ position: "relative" }}>
                                {f.url
                                    ? <img src={f.url} style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", border: "1px solid #333", display: "block" }} />
                                    : (
                                        <div style={{ width: 56, height: 56, borderRadius: 10, background: "#222", border: "1px solid #333", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                                            <FileText size={18} color="#7c3aed" />
                                            <span style={{ fontSize: 9, color: "#666", maxWidth: 44, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{f.name}</span>
                                        </div>
                                    )
                                }
                                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                    style={{ position: "absolute", top: -5, right: -5, width: 17, height: 17, borderRadius: "50%", background: "#333", border: "1px solid #444", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                    <X size={9} color="white" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Input row */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                    <button onClick={() => fileInputRef.current?.click()}
                        style={{
                            flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                            background: "#222", border: "1px solid #303030",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", alignSelf: "flex-end", marginBottom: 1
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#2a2a2a"}
                        onMouseLeave={e => e.currentTarget.style.background = "#222"}
                    >
                        <Plus size={17} color="#888" />
                    </button>
                    <input ref={fileInputRef} type="file" multiple style={{ display: "none" }}
                        onChange={e => handleFiles(e.target.files)} />

                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        // ✅ FIX: disabled during both uploading and generating
                        disabled={isLocked}
                        placeholder={isUploading ? "Ingesting document..." : isGenerating ? "Generating response..." : "Message c-net..."}
                        rows={1}
                        style={{
                            flex: 1,
                            background: "transparent",
                            resize: "none",
                            color: "#d0d0d0",
                            outline: "none",
                            fontSize: 14,
                            lineHeight: "1.6",
                            maxHeight: 180,
                            border: "none",
                            fontFamily: "inherit",
                            padding: "6px 0",
                            alignSelf: "center",
                            display: "block",
                            width: "100%"
                        }}
                    />

                    {/* Button States: Uploading Spinner -> Generating Square -> Send Arrow */}
                    {isUploading ? (
                        <div style={{
                            flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                            background: "#1f1f1f", border: "1px solid #2a2a2a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            alignSelf: "flex-end", marginBottom: 1
                        }}>
                            <Loader2 size={16} color="#888" style={{ animation: "spin-slow 1.5s linear infinite" }} />
                        </div>
                    ) : isGenerating ? (
                        <button onClick={onStop}
                            style={{
                                flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                                background: "#2a1a1a", border: "1px solid #3d2020",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: "pointer", alignSelf: "flex-end", marginBottom: 1
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#3d1f1f"}
                            onMouseLeave={e => e.currentTarget.style.background = "#2a1a1a"}
                        >
                            <Square size={14} color="#f87171" />
                        </button>
                    ) : (
                        <button onClick={handleSend} disabled={!canSend}
                            style={{
                                flexShrink: 0, width: 36, height: 36, borderRadius: 10,
                                background: canSend ? "linear-gradient(135deg, #7c3aed, #4f46e5)" : "#1f1f1f",
                                border: canSend ? "none" : "1px solid #2a2a2a",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                cursor: canSend ? "pointer" : "not-allowed",
                                alignSelf: "flex-end", marginBottom: 1,
                                transition: "all 0.2s"
                            }}
                        >
                            <Send size={14} color={canSend ? "white" : "#444"} />
                        </button>
                    )}
                </div>

                {dragging && (
                    <div style={{ textAlign: "center", fontSize: 12, color: "#7c3aed", paddingBottom: 10, opacity: 0.8 }}>
                        Drop files to upload
                    </div>
                )}
            </div>
            <p style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 8 }}>
                Press Enter to send · Shift+Enter for new line
            </p>
        </div>
    )
}