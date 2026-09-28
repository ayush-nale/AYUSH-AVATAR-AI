export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ChatRole;
  content: string;
  attachment?: {
    name: string;
    type: string;
    data: string; // base64
  };
  created_at: string;
};

export type Conversation = {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
};
