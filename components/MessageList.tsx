// Message List Component
import React, { useEffect, useRef } from 'react'
import type { Message } from '@/src/types'
import MessageBubble from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  onSuggestedQuestion: (question: string) => void
}

const SUGGESTED_QUESTIONS = [
  "What's your return policy?",
  "Do you ship internationally?",
  "What are your support hours?",
  "Tell me about current promotions",
]

export default function MessageList({ 
  messages, 
  isLoading,
  onSuggestedQuestion 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isLoading])

  // Empty state
  if (messages.length === 0 && !isLoading) {
    return (
      <div className="message-list">
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>Hey there! 👋</h3>
          <p>
            I'm Alex, your support assistant at TechNest. 
            Ask me anything about our products, shipping, returns, or promotions!
          </p>
          <div className="suggested-questions">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                className="suggested-btn"
                onClick={() => onSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && (
        <div className="typing-indicator">
          <div className="typing-dots">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
          <span>Alex is thinking...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}
