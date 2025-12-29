// Chat Input Component
import React, { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { MAX_MESSAGE_LENGTH } from '@/src/lib/constants'

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading: boolean
  initialValue?: string
}

export default function ChatInput({ onSend, isLoading, initialValue = '' }: ChatInputProps) {
  const [message, setMessage] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update message when initialValue changes (for suggested questions)
  useEffect(() => {
    if (initialValue) {
      setMessage(initialValue)
      // Focus the input
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [initialValue])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = () => {
    const trimmed = message.trim()
    if (!trimmed || isLoading) return
    
    onSend(trimmed)
    setMessage('')
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Allow typing but warn/limit at max
    if (value.length <= MAX_MESSAGE_LENGTH + 100) {
      setMessage(value)
    }
  }

  const charCount = message.length
  const isNearLimit = charCount >= MAX_MESSAGE_LENGTH * 0.9
  const isOverLimit = charCount > MAX_MESSAGE_LENGTH
  const canSend = message.trim().length > 0 && !isLoading && !isOverLimit

  return (
    <div className="chat-input-container">
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isLoading}
          rows={1}
        />
        <button
          className="send-button"
          onClick={handleSubmit}
          disabled={!canSend}
          title={isLoading ? 'Sending...' : 'Send message'}
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            '➤'
          )}
        </button>
      </div>
      {(isNearLimit || isOverLimit) && (
        <div className={`char-count ${isOverLimit ? 'error' : 'warning'}`}>
          {charCount}/{MAX_MESSAGE_LENGTH}
          {isOverLimit && ' - Message too long'}
        </div>
      )}
    </div>
  )
}
