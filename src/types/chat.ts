// 聊天相關類型定義

export interface ChatRoom {
  id: string;
  matchId?: string;
  type: 'direct' | 'group' | 'match';
  name?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatParticipant {
  id: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string;
  isActive: boolean;
  user?: UserInfo;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: 'text' | 'image' | 'file';
  isRead: boolean;
  createdAt: string;
  sender?: UserInfo;
}

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface CreateChatRoomRequest {
  matchId?: string;
  type: 'direct' | 'group' | 'match';
  name?: string;
  participantIds: string[];
}

export interface SendMessageRequest {
  chatRoomId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
}

export interface WebSocketMessage {
  type: string;
  chatRoomId?: string;
  data: any;
  timestamp: string;
}

export interface ChatMessageData {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: string;
  createdAt: string;
}