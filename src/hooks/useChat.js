import { useState, useCallback, useRef, useEffect } from "react"

const API = import.meta.env.VITE_API_URL

let idCounter = 1
const uid = () => `id_${Date.now()}_${idCounter++}`

function makeConversation(overrides = {}) {
    const sessionId = overrides.sessionId || crypto.randomUUID()
    return {
        id: sessionId,
        sessionId,
        title: "New Chat",
        messages: [],
        loadedFromDB: false,
        ...overrides,
    }
}

export function useChat() {
    const [conversations, setConversations] = useState(() => [makeConversation()])
    const [activeId, setActiveId] = useState(() => {
        return conversations?.[0]?.id ?? ""
    })
    const [isGenerating, setIsGenerating] = useState(false)
    const [isLoadingSessions, setIsLoadingSessions] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const stopRef = useRef(false)

    const [_init] = useState(() => makeConversation())
    const activeIdRef = useRef(activeId)
    activeIdRef.current = activeId

    const activeMessages = conversations.find(c => c.id === activeId)?.messages ?? []

    useEffect(() => {
        async function loadSessions() {
            setIsLoadingSessions(true)
            try {
                const res = await fetch(`${API}/sessions`)
                if (!res.ok) throw new Error(`Status ${res.status}`)
                const sessions = await res.json()

                if (!sessions.length) {
                    setIsLoadingSessions(false)
                    return
                }

                const fromDB = sessions.map(s =>
                    makeConversation({
                        sessionId: s.id,
                        title: s.title,
                        loadedFromDB: true,
                    })
                )

                setConversations(fromDB)
                setActiveId(fromDB[0].id)
            } catch (err) {
                console.warn("Could not reach API — running in offline mode:", err)
            } finally {
                setIsLoadingSessions(false)
            }
        }
        loadSessions()
    }, [])

    const selectConversation = useCallback(async (id) => {
        setActiveId(id)

        setConversations(prev => {
            const conv = prev.find(c => c.id === id)
            if (!conv || !conv.loadedFromDB || conv.messages.length > 0) return prev

            fetch(`${API}/sessions/${id}/history?limit=100`)
                .then(r => r.ok ? r.json() : Promise.reject(r.status))
                .then(data => {
                    setConversations(latest =>
                        latest.map(c =>
                            c.id !== id ? c : {
                                ...c,
                                messages: data.messages.map(m => ({
                                    id: uid(),
                                    role: m.role,
                                    text: m.text,
                                    timestamp: Date.now(),
                                    files: [],
                                }))
                            }
                        )
                    )
                })
                .catch(err => console.warn("Failed to load history for", id, err))

            return prev
        })
    }, [])

    const sendMessage = useCallback(async ({ text, files }) => {
        const currentId = activeIdRef.current
        let sessionId = currentId
        let isFirstMessage = false

        setConversations(prev => {
            const conv = prev.find(c => c.id === currentId)
            if (!conv) return prev
            isFirstMessage = conv.messages.length === 0
            sessionId = conv.sessionId
            return prev
        })

        const userMsg = {
            id: uid(), role: "user", text,
            files: files || [], timestamp: Date.now()
        }

        setConversations(prev =>
            prev.map(c => {
                if (c.id !== currentId) return c
                return {
                    ...c,
                    title: c.messages.length === 0 ? (text?.slice(0, 40) || "New Chat") : c.title,
                    messages: [...c.messages, userMsg]
                }
            })
        )

        setIsGenerating(true)
        stopRef.current = false

        // --- FILE UPLOAD ---
        if (files && files.length > 0) {
            setIsUploading(true)
            await new Promise(resolve => setTimeout(resolve, 0))

            for (const file of files) {
                const formData = new FormData()
                formData.append("file", file.file || file)

                try {
                    const uploadRes = await fetch(`${API}/upload`, {
                        method: "POST",
                        body: formData,
                    })

                    if (!uploadRes.ok) {
                        const errorDetail = await uploadRes.json()
                        console.error(`Upload failed with status ${uploadRes.status}:`, errorDetail)
                        alert(`Upload failed! Check the developer console for the 422 error details.`)
                        continue
                    }

                    const uploadData = await uploadRes.json()

                    if (uploadData.status === "already_exists") {
                        alert(`Notice: "${(file.file || file).name}" is already stored in the database!\n\nI will go ahead and answer your query using the existing document.`)
                    }
                } catch (err) {
                    console.error("Upload network error:", err)
                }
            }
        }
        // --- END FILE UPLOAD ---

        const assistantId = uid()
        setConversations(prev =>
            prev.map(c =>
                c.id === currentId
                    ? { ...c, messages: [...c.messages, { id: assistantId, role: "assistant", text: "", timestamp: Date.now(), files: [] }] }
                    : c
            )
        )

        setIsUploading(false)

        try {
            const response = await fetch(`${API}/chat/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    query: text,
                }),
            })

            if (!response.ok) throw new Error(`API error: ${response.status}`)

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ""

            outer: while (true) {
                if (stopRef.current) {
                    reader.cancel()
                    break
                }

                let value, done
                try {
                    ; ({ value, done } = await reader.read())
                } catch (readErr) {
                    // ✅ FIX: reader.cancel() throws an AbortError — treat it as a
                    // clean stop, not an error, so no error message is shown in chat
                    if (stopRef.current) break
                    throw readErr
                }

                if (done) break

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split("\n")
                buffer = lines.pop()

                for (const line of lines) {
                    if (!line.startsWith("data: ")) continue
                    const raw = line.slice(6).trim()
                    if (!raw) continue

                    let parsed
                    try { parsed = JSON.parse(raw) } catch { continue }

                    if (parsed.done) break outer

                    if (parsed.error) {
                        setConversations(prev =>
                            prev.map(c =>
                                c.id !== currentId ? c : {
                                    ...c,
                                    messages: c.messages.map(m =>
                                        m.id === assistantId
                                            ? { ...m, text: `[Error: ${parsed.error}]` }
                                            : m
                                    )
                                }
                            )
                        )
                        break outer
                    }

                    if (parsed.token) {
                        setConversations(prev =>
                            prev.map(c =>
                                c.id !== currentId ? c : {
                                    ...c,
                                    messages: c.messages.map(m =>
                                        m.id === assistantId
                                            ? { ...m, text: m.text + parsed.token }
                                            : m
                                    )
                                }
                            )
                        )
                    }
                }
            }
        } catch (err) {
            // ✅ FIX: if stop was pressed, suppress the error — text already in chat is preserved
            if (!stopRef.current) {
                console.error("Stream failed:", err)
                setConversations(prev =>
                    prev.map(c =>
                        c.id !== currentId ? c : {
                            ...c,
                            messages: c.messages.map(m =>
                                m.id === assistantId
                                    ? { ...m, text: m.text || "[Connection error. Is the API running on port 8000?]" }
                                    : m
                            )
                        }
                    )
                )
            }
        }

        setIsGenerating(false)
    }, [])

    const stopGeneration = useCallback(() => {
        stopRef.current = true
        setIsGenerating(false)
    }, [])

    const newConversation = useCallback(() => {
        const c = makeConversation()
        setConversations(prev => [c, ...prev])
        setActiveId(c.id)
    }, [])

    const deleteConversation = useCallback((id) => {
        setConversations(prev => {
            const next = prev.filter(c => c.id !== id)
            if (next.length === 0) {
                const fresh = makeConversation()
                setActiveId(fresh.id)
                return [fresh]
            }
            if (id === activeIdRef.current) setActiveId(next[0].id)
            return next
        })

        fetch(`${API}/sessions/${id}`, { method: "DELETE" })
            .catch(err => console.warn("DB delete failed for", id, err))
    }, [])

    const renameConversation = useCallback((id, newTitle) => {
        setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, title: newTitle } : c)
        )

        fetch(`${API}/sessions/${id}/title`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newTitle }),
        }).catch(err => console.warn("Rename persist failed for", id, err))
    }, [])

    return {
        conversations,
        activeId,
        activeMessages,
        isGenerating,
        isLoadingSessions,
        isUploading,
        sendMessage,
        stopGeneration,
        newConversation,
        selectConversation,
        deleteConversation,
        renameConversation,
    }
}