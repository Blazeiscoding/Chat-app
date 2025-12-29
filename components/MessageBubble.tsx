
import React, { useMemo } from 'react'
import type { Message } from '@/src/types'

interface MessageBubbleProps {
  message: Message
}


function parseMarkdown(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  

  const lines = text.split('\n')
  let currentList: string[] = []
  let listType: 'ul' | 'ol' | null = null
  
  const flushList = () => {
    if (currentList.length > 0 && listType) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul'
      elements.push(
        <ListTag key={`list-${elements.length}`} className="md-list">
          {currentList.map((item, i) => (
            <li key={i}>{parseInline(item)}</li>
          ))}
        </ListTag>
      )
      currentList = []
      listType = null
    }
  }
  
  lines.forEach((line, lineIndex) => {

    const ulMatch = line.match(/^[-*]\s+(.+)$/)
    if (ulMatch) {
      if (listType !== 'ul') flushList()
      listType = 'ul'
      currentList.push(ulMatch[1])
      return
    }
    

    const olMatch = line.match(/^\d+\.\s+(.+)$/)
    if (olMatch) {
      if (listType !== 'ol') flushList()
      listType = 'ol'
      currentList.push(olMatch[1])
      return
    }
    

    flushList()
    

    const h3Match = line.match(/^###\s+(.+)$/)
    if (h3Match) {
      elements.push(<h4 key={`h3-${lineIndex}`} className="md-h3">{parseInline(h3Match[1])}</h4>)
      return
    }
    
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      elements.push(<h3 key={`h2-${lineIndex}`} className="md-h2">{parseInline(h2Match[1])}</h3>)
      return
    }
    
    const h1Match = line.match(/^#\s+(.+)$/)
    if (h1Match) {
      elements.push(<h2 key={`h1-${lineIndex}`} className="md-h1">{parseInline(h1Match[1])}</h2>)
      return
    }
    

    if (line.trim() === '') {
      elements.push(<br key={`br-${lineIndex}`} />)
      return
    }
    

    elements.push(
      <p key={`p-${lineIndex}`} className="md-p">
        {parseInline(line)}
      </p>
    )
  })
  

  flushList()
  
  return elements
}


function parseInline(text: string): React.ReactNode[] {
  const elements: React.ReactNode[] = []
  let remaining = text
  let keyIndex = 0
  
  const patterns = [
    { regex: /`([^`]+)`/, render: (match: string) => <code key={keyIndex++} className="md-code">{match}</code> },
    { regex: /\*\*([^*]+)\*\*/, render: (match: string) => <strong key={keyIndex++} className="md-bold">{match}</strong> },
    { regex: /\*([^*]+)\*/, render: (match: string) => <em key={keyIndex++} className="md-italic">{match}</em> },
    { regex: /\[([^\]]+)\]\(([^)]+)\)/, render: (_text: string, url: string) => (
      <a key={keyIndex++} href={url} target="_blank" rel="noopener noreferrer" className="md-link">{_text}</a>
    )},
  ]
  
  while (remaining.length > 0) {
    let earliestMatch = null
    let earliestIndex = Infinity
    let matchedPattern = null
    
    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex)
      if (match && match.index !== undefined && match.index < earliestIndex) {
        earliestMatch = match
        earliestIndex = match.index
        matchedPattern = pattern
      }
    }
    
    if (earliestMatch && matchedPattern) {
      if (earliestIndex > 0) {
        elements.push(remaining.substring(0, earliestIndex))
      }
      
      if (earliestMatch[2]) {
        elements.push(matchedPattern.render(earliestMatch[1], earliestMatch[2]))
      } else {
        elements.push(matchedPattern.render(earliestMatch[1], earliestMatch[1]))
      }
      
      remaining = remaining.substring(earliestIndex + earliestMatch[0].length)
    } else {
      elements.push(remaining)
      break
    }
  }
  
  return elements
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === 'user'
  

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }


  const content = useMemo(() => {
    if (isUser) {
      return message.text
    }
    return parseMarkdown(message.text)
  }, [message.text, isUser])

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'ai'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {isUser ? content : <div className="md-content">{content}</div>}
        </div>
        <span className="message-time">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}
