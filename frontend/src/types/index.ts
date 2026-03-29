export interface User {
  id: string
  name: string
  email: string
  plan: "free" | "pro" | "business"
  api_key: string
  created_at: string
}

export interface Bot {
  id: string
  name: string
  model: "claude" | "gpt"
  system_prompt: string
  language: string
  color: string
  logo: string | null
  widget_key: string
  widget_snippet: string
  is_active: boolean
  created_at: string
}

export interface Document {
  id: string
  filename: string
  status: "pending" | "processing" | "done" | "error"
  created_at: string
}

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  feedback: "like" | "dislike" | null
  created_at: string
}

export interface Conversation {
  id: string
  session_id: string
  created_at: string
  messages: Message[]
}

export interface GlobalStats {
  plan: string
  bots: {
    total: number
    active: number
    limit: number
  }
  conversations: number
  messages: number
  documents: number
  feedback: {
    likes: number
    dislikes: number
  }
  bots_summary: {
    id: string
    name: string
    model: string
    is_active: boolean
    conversations: number
    messages: number
  }[]
}