import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatRoom, ChatMessage, CreateChatRoomRequest, SendMessageRequest, WebSocketMessage } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/api/v1';

interface UseChatApiOptions {
  accessToken?: string;
}

export const useChatApi = ({ accessToken }: UseChatApiOptions = {}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<{ [roomId: string]: ChatMessage[] }>({});
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // API 請求輔助函數
  const apiRequest = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }, [accessToken]);

  // WebSocket 連接
  const connectWebSocket = useCallback(() => {
    if (!accessToken || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const wsUrl = `${WS_BASE_URL}/chat/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket 連接已建立');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (err) {
          console.error('解析 WebSocket 訊息失敗:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket 連接已關閉:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // 自動重連
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 指數退避
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 錯誤:', error);
        setError('WebSocket 連接錯誤');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('建立 WebSocket 連接失敗:', err);
      setError('無法建立 WebSocket 連接');
    }
  }, [accessToken]);

  // 處理 WebSocket 訊息
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'new_message':
        if (message.data && message.chatRoomId) {
          setMessages(prev => ({
            ...prev,
            [message.chatRoomId!]: [
              ...(prev[message.chatRoomId!] || []),
              message.data as ChatMessage
            ]
          }));
        }
        break;

      case 'messages_read':
        // 處理訊息已讀狀態更新
        if (message.data && message.chatRoomId) {
          const { userId, readAt } = message.data;
          // 更新聊天室參與者的最後讀取時間
          setChatRooms(prev => prev.map(room => {
            if (room.id === message.chatRoomId) {
              return {
                ...room,
                participants: room.participants.map(p => 
                  p.userId === userId ? { ...p, lastReadAt: readAt } : p
                )
              };
            }
            return room;
          }));
        }
        break;

      case 'user_joined':
      case 'user_left':
        // 處理用戶加入/離開事件
        console.log(`用戶 ${message.data?.userId} ${message.type === 'user_joined' ? '加入' : '離開'} 聊天室`);
        break;

      case 'pong':
        // 心跳響應
        break;

      default:
        console.log('未處理的 WebSocket 訊息類型:', message.type);
    }
  }, []);

  // 發送 WebSocket 訊息
  const sendWebSocketMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // 獲取聊天室列表
  const fetchChatRooms = useCallback(async () => {
    try {
      setLoading(true);
      const rooms = await apiRequest('/api/v1/chat/rooms');
      setChatRooms(rooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取聊天室列表失敗');
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // 創建聊天室
  const createChatRoom = useCallback(async (request: CreateChatRoomRequest): Promise<ChatRoom> => {
    try {
      setLoading(true);
      const room = await apiRequest('/api/v1/chat/rooms', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      setChatRooms(prev => [room, ...prev]);
      return room;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '創建聊天室失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // 獲取聊天室訊息
  const fetchMessages = useCallback(async (roomId: string, page = 1, limit = 50) => {
    try {
      setLoading(true);
      const roomMessages = await apiRequest(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
      setMessages(prev => ({
        ...prev,
        [roomId]: page === 1 ? roomMessages : [...(prev[roomId] || []), ...roomMessages]
      }));
      return roomMessages;
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取訊息失敗');
      return [];
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // 發送訊息
  const sendMessage = useCallback(async (request: SendMessageRequest): Promise<ChatMessage> => {
    try {
      const message = await apiRequest('/api/v1/chat/messages', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      
      // 本地更新訊息列表（WebSocket 也會推送，但本地更新可以提供更好的用戶體驗）
      setMessages(prev => ({
        ...prev,
        [request.chatRoomId]: [...(prev[request.chatRoomId] || []), message]
      }));
      
      return message;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '發送訊息失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [apiRequest]);

  // 標記訊息為已讀
  const markMessagesAsRead = useCallback(async (roomId: string) => {
    try {
      await apiRequest(`/chat/rooms/${roomId}/read`, {
        method: 'POST',
      });
      
      // 更新本地未讀計數
      setChatRooms(prev => prev.map(room => 
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : '標記已讀失敗');
    }
  }, [apiRequest]);

  // 加入聊天室
  const joinChatRoom = useCallback(async (roomId: string) => {
    try {
      await apiRequest(`/chat/rooms/${roomId}/join`, {
        method: 'POST',
      });
      
      // 發送 WebSocket 加入訊息
      sendWebSocketMessage({
        type: 'join_room',
        data: roomId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '加入聊天室失敗');
    }
  }, [apiRequest, sendWebSocketMessage]);

  // 離開聊天室
  const leaveChatRoom = useCallback(async (roomId: string) => {
    try {
      await apiRequest(`/chat/rooms/${roomId}/leave`, {
        method: 'POST',
      });
      
      // 發送 WebSocket 離開訊息
      sendWebSocketMessage({
        type: 'leave_room',
        data: roomId
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '離開聊天室失敗');
    }
  }, [apiRequest, sendWebSocketMessage]);

  // 獲取在線用戶
  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await apiRequest('/api/v1/chat/online-users');
      setOnlineUsers(response.onlineUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取在線用戶失敗');
    }
  }, [apiRequest]);

  // 心跳檢測
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendWebSocketMessage({ type: 'ping' });
    }, 30000); // 每30秒發送一次心跳

    return () => clearInterval(pingInterval);
  }, [isConnected, sendWebSocketMessage]);

  // 初始化連接
  useEffect(() => {
    if (accessToken) {
      connectWebSocket();
      fetchChatRooms();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [accessToken, connectWebSocket, fetchChatRooms]);

  return {
    // 狀態
    chatRooms,
    messages,
    onlineUsers,
    isConnected,
    loading,
    error,

    // 方法
    createChatRoom,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    joinChatRoom,
    leaveChatRoom,
    fetchOnlineUsers,
    connectWebSocket,
    
    // WebSocket 方法
    sendWebSocketMessage,
  };
};