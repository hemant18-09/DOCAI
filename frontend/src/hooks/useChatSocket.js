import { useEffect, useRef } from 'react'

export default function useChatSocket(roomId, onMessage) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!roomId) return

    socketRef.current = new WebSocket(
      `${import.meta.env.VITE_WS_BASE}/ws/chat/${roomId}`
    )

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onMessage(data)
    }

    return () => {
      socketRef.current?.close()
    }
  }, [roomId])

  const send = (payload) => {
    socketRef.current?.send(JSON.stringify(payload))
  }

  return { send }
}
