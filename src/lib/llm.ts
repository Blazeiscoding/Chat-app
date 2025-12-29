// LLM Service - Wrapper for Gemini API using OpenAI SDK
import OpenAI from 'openai'
import { SYSTEM_PROMPT, MAX_HISTORY_MESSAGES, MAX_TOKENS } from './constants'
import type { Message, LLMMessage } from '@/src/types'

// Initialize OpenAI client with Gemini API configuration
const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
})

/**
 * Convert database messages to LLM message format
 */
function formatMessagesForLLM(messages: Message[]): LLMMessage[] {
  return messages.map((msg) => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.text,
  }))
}

/**
 * Generate a reply using the LLM
 * @param history - Previous messages in the conversation
 * @param userMessage - The current user message
 * @returns The AI-generated reply
 */
export async function generateReply(
  history: Message[],
  userMessage: string
): Promise<string> {
  try {
    // Take only the last N messages for context (cost control)
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES)
    
    // Build the messages array for the API call
    const messages: LLMMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...formatMessagesForLLM(recentHistory),
      { role: 'user', content: userMessage },
    ]

    // Call the Gemini API via OpenAI SDK
    const response = await openai.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: messages,
      max_tokens: MAX_TOKENS,
      temperature: 0.7, // Slightly creative but still focused
    })

    // Extract the reply
    const reply = response.choices[0]?.message?.content

    if (!reply) {
      throw new Error('No response content received from LLM')
    }

    return reply.trim()
  } catch (error) {
    // Handle specific error types
    if (error instanceof OpenAI.APIError) {
      console.error('LLM API Error:', {
        status: error.status,
        message: error.message,
        code: error.code,
      })

      // Handle specific error codes
      switch (error.status) {
        case 401:
          throw new Error('API authentication failed. Please check your API key.')
        case 429:
          throw new Error('Too many requests. Please wait a moment and try again.')
        case 500:
        case 502:
        case 503:
          throw new Error('The AI service is temporarily unavailable. Please try again later.')
        default:
          throw new Error('An error occurred while generating a response. Please try again.')
      }
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('The request timed out. Please try again.')
    }

    // Re-throw unknown errors with a generic message
    console.error('Unexpected LLM error:', error)
    throw new Error('Something went wrong. Please try again later.')
  }
}

/**
 * Validate and sanitize user input
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || typeof message !== 'string') {
    return { valid: false, error: 'Message is required' }
  }

  const trimmed = message.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'Message is too long (max 2000 characters)' }
  }

  return { valid: true }
}
