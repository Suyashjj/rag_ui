import { FileText } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const markdownStyles = `
    .md-body { color: #ccc; font-size: 15px; line-height: 1.75; word-break: break-word; }
    .md-body p { margin: 0 0 12px; }
    .md-body p:last-child { margin-bottom: 0; }
    .md-body h1, .md-body h2, .md-body h3 { color: #e0e0e0; font-weight: 600; margin: 20px 0 10px; }
    .md-body h1 { font-size: 20px; }
    .md-body h2 { font-size: 18px; }
    .md-body h3 { font-size: 16px; }
    .md-body ul, .md-body ol { padding-left: 22px; margin: 4px 0 12px; }
    .md-body li { margin-bottom: 5px; }
    .md-body code {
        background: #2a2a2a; border: 1px solid #333; border-radius: 5px;
        padding: 2px 6px; font-size: 13px; color: #a78bfa; font-family: monospace;
    }
    .md-body pre {
        background: #161616; border: 1px solid #2a2a2a; border-radius: 10px;
        padding: 14px 16px; overflow-x: auto; margin: 12px 0;
    }
    .md-body pre code { background: none; border: none; padding: 0; color: #bbb; }
    .md-body blockquote {
        border-left: 3px solid #7c3aed; margin: 10px 0;
        padding: 6px 14px; color: #888; background: #161616; border-radius: 0 8px 8px 0;
    }
    .md-body strong { color: #e8e8e8; font-weight: 600; }
    .md-body a { color: #7c3aed; text-decoration: underline; }
    .md-body hr { border: none; border-top: 1px solid #2a2a2a; margin: 16px 0; }
    .md-body table {
        width: 100%; border-collapse: collapse; margin: 14px 0;
        font-size: 14px;
    }
    .md-body th {
        background: #1e1e1e; color: #e0e0e0; font-weight: 600;
        padding: 9px 14px; text-align: left; border-bottom: 2px solid #333;
    }
    .md-body td { padding: 8px 14px; border-bottom: 1px solid #222; color: #bbb; }
    .md-body tr:last-child td { border-bottom: none; }
    .md-body tr:hover td { background: #1a1a1a; }
`

export default function MessageBubble({ message }) {
    const isUser = message.role === "user"

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isUser ? "flex-end" : "flex-start",
            gap: 8,
            animation: "fadeSlideUp 0.25s ease forwards"
        }}>
            <style>{markdownStyles}</style>

            {/* File previews */}
            {message.files?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {message.files.map((f, i) => <FileChip key={i} file={f} />)}
                </div>
            )}

            {message.text && (
                isUser ? (
                    <div style={{
                        padding: "10px 16px",
                        borderRadius: "18px 4px 18px 18px",
                        fontSize: 15,
                        lineHeight: "1.65",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                        color: "#fff",
                        maxWidth: "75%",
                        boxSizing: "border-box"
                    }}>
                        {message.text}
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14, width: "100%" }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: "50%",
                            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0, marginTop: 2
                        }}>
                            <span style={{ fontSize: 12 }}>⚡</span>
                        </div>
                        <div className="md-body" style={{ flex: 1, paddingTop: 3 }}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.text}
                            </ReactMarkdown>
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
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a2a", maxWidth: 200 }}>
                <img src={file.url} alt={file.name} style={{ objectFit: "cover", width: "100%", maxHeight: 160, display: "block" }} />
            </div>
        )
    }
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "#1e1e1e", border: "1px solid #2a2a2a",
            borderRadius: 10, padding: "8px 12px"
        }}>
            <FileText size={14} color="#7c3aed" />
            <span style={{ fontSize: 12, color: "#888", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
        </div>
    )
}