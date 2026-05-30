import { FileText, Sparkles, ChevronDown } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const markdownStyles = `
    .md-body { color: #c0c0c0; font-size: 16px; line-height: 1.8; letter-spacing: 0.015em; word-break: break-word; }
    .md-body p { margin: 0 0 14px; }
    .md-body p:last-child { margin-bottom: 0; }
    .md-body h1, .md-body h2, .md-body h3 { color: #e8e8e8; font-weight: 600; margin: 22px 0 10px; letter-spacing: 0.01em; }
    .md-body h1 { font-size: 20px; }
    .md-body h2 { font-size: 18px; }
    .md-body h3 { font-size: 16px; }
    .md-body ul, .md-body ol { padding-left: 22px; margin: 4px 0 14px; }
    .md-body li { margin-bottom: 6px; }
    .md-body code {
        background: #1e1e1e; border: 1px solid #2a2a2a; border-radius: 5px;
        padding: 2px 6px; font-size: 13px; color: #a8a8a8; font-family: monospace;
    }
    .md-body pre {
        background: #141414; border: 1px solid #222; border-radius: 10px;
        padding: 14px 16px; overflow-x: auto; margin: 12px 0;
    }
    .md-body pre code { background: none; border: none; padding: 0; color: #aaa; }
    .md-body blockquote {
        border-left: 3px solid #333; margin: 10px 0;
        padding: 6px 14px; color: #777; background: #141414; border-radius: 0 8px 8px 0;
    }
    .md-body strong { color: #e8e8e8; font-weight: 600; }
    .md-body a { color: #999; text-decoration: underline; }
    .md-body hr { border: none; border-top: 1px solid #222; margin: 16px 0; }
    .md-body table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 14px; }
    .md-body th {
        background: #181818; color: #d0d0d0; font-weight: 600;
        padding: 9px 14px; text-align: left; border-bottom: 2px solid #2a2a2a;
    }
    .md-body td { padding: 8px 14px; border-bottom: 1px solid #1e1e1e; color: #a0a0a0; }
    .md-body tr:last-child td { border-bottom: none; }
    .md-body tr:hover td { background: #161616; }

    @keyframes sparkle-spin {
        0%   { transform: rotate(0deg) scale(1);   opacity: 0.9; }
        50%  { transform: rotate(180deg) scale(1.15); opacity: 1; }
        100% { transform: rotate(360deg) scale(1);  opacity: 0.9; }
    }
    .sparkle-icon { animation: sparkle-spin 3s linear infinite; }

    @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideDown {
        from { opacity: 0; max-height: 0; transform: translateY(-4px); }
        to   { opacity: 1; max-height: 500px; transform: translateY(0); }
    }
    .sources-dropdown { animation: slideDown 0.25s ease forwards; overflow: hidden; }

    .sources-toggle {
        display: inline-flex; align-items: center; gap: 6px;
        background: #161616; border: 1px solid #262626;
        border-radius: 8px; padding: 6px 10px;
        font-size: 12px; color: #888; cursor: pointer;
        transition: all 0.18s ease; user-select: none;
    }
    .sources-toggle:hover { background: #1c1c1c; color: #bbb; border-color: #333; }
    .chevron { transition: transform 0.25s ease; }
    .chevron.open { transform: rotate(180deg); }
`

export default function MessageBubble({ message, isStreaming }) {
    const isUser = message.role === "user"
    const [showSources, setShowSources] = useState(false)

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 8,
            animation: "fadeSlideUp 0.2s ease forwards"
        }}>
            <style>{markdownStyles}</style>

            {message.files?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {message.files.map((f, i) => <FileChip key={i} file={f} />)}
                </div>
            )}

            {message.text && (
                isUser ? (
                    <div style={{
                        padding: "11px 16px",
                        borderRadius: "18px 4px 18px 18px",
                        fontSize: 15,
                        lineHeight: "1.7",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        background: "#232323",
                        color: "#ebebeb",
                        maxWidth: "75%",
                        boxSizing: "border-box",
                        border: "1px solid #333",
                    }}>
                        {message.text}
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%" }}>
                        {/* ✅ Show spinning Sparkles avatar ONLY while streaming */}
                        {isStreaming && (
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                background: "#1e1e1e",
                                border: "1px solid #2e2e2e",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, marginTop: 2
                            }}>
                                <Sparkles className="sparkle-icon" size={13} color="#777" />
                            </div>
                        )}

                        <div className="md-body" style={{ flex: 1, paddingTop: 3, minWidth: 0 }}>
                            {(() => {
                                const raw = message.text.replace(/\n?METADATA:\[.*?\]/gs, "").trimEnd()
                                const citationRegex = /\[([^\]]*\.pdf[^\]]*)\]/g
                                const citations = []
                                let match
                                while ((match = citationRegex.exec(raw)) !== null) {
                                    citations.push(match[1])
                                }
                                const cleanText = raw
                                    .replace(/\[([^\]]*\.pdf[^\]]*)\]/g, "")
                                    .replace(/\s+([.,])/g, "$1")
                                    .trim()

                                const uniqueCitations = [...new Set(citations)]

                                return (
                                    <>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {cleanText}
                                        </ReactMarkdown>

                                        {uniqueCitations.length > 0 && (
                                            <div style={{ marginTop: 12 }}>
                                                <button
                                                    className="sources-toggle"
                                                    onClick={() => setShowSources(s => !s)}
                                                >
                                                    <FileText size={12} color="#888" />
                                                    View Sources ({uniqueCitations.length})
                                                    <ChevronDown
                                                        size={13}
                                                        className={`chevron ${showSources ? "open" : ""}`}
                                                    />
                                                </button>

                                                {showSources && (
                                                    <div
                                                        className="sources-dropdown"
                                                        style={{
                                                            marginTop: 8,
                                                            paddingTop: 8,
                                                            borderTop: "1px solid #222",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            gap: 4
                                                        }}
                                                    >
                                                        {uniqueCitations.map((cite, i) => (
                                                            <span key={i} style={{
                                                                display: "flex", alignItems: "center", gap: 6,
                                                                fontSize: 12, color: "#666",
                                                                paddingLeft: 8, borderLeft: "2px solid #2e2e2e",
                                                            }}>
                                                                <FileText size={11} color="#555" />
                                                                {cite}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                )
            )}
        </div>
    )
}

function FileChip({ file }) {
    const isImage = file.type?.startsWith("image/")
    if (isImage && file.url) {
        return (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #222", maxWidth: 200 }}>
                <img src={file.url} alt={file.name} style={{ objectFit: "cover", width: "100%", maxHeight: 160, display: "block" }} />
            </div>
        )
    }
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#181818", border: "1px solid #252525",
            borderRadius: 10, padding: "8px 12px"
        }}>
            <FileText size={14} color="#666" />
            <span style={{ fontSize: 12, color: "#777", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        </div>
    )
}
