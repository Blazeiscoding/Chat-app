
import React from 'react'
import Head from 'next/head'
import ChatWidget from '@/components/ChatWidget'

export default function Home() {
  return (
    <>
      <Head>
        <title>TechNest Support | AI Chat Agent</title>
        <meta 
          name="description" 
          content="Get instant help from our AI-powered support agent. Ask about shipping, returns, products, and more." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container">
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="brand-icon">🛒</div>
            <div>
              <h1>TechNest Support</h1>
              <p>AI-Powered Customer Support</p>
            </div>
          </div>
        </header>
        
        <ChatWidget />
      </main>
    </>
  )
}
