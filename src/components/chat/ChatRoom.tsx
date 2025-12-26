'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChatRoom as ChatRoomType, ChatMessage } from '@/types/chat';
import { useChatApi } from '@/hooks/useChatApi';

interface ChatRoomProps {
  room: ChatRoomType;
  currentUserId: string;
  accessToken: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ room, currentUserId, accessToken }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    joinChatRoom,
    isConnected,
    loading,
    error
  } = useChatApi({ accessToken });

  const roomMessages = messages[room.id] || [];

  // 自動滾動到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 處理發送訊息
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      await sendMessage({
        chatRoomId: room.id,
        content: newMessage.trim(),
        messageType: 'text'
      });
      setNewMessage('');
    } catch (err) {
      console.error('發送訊息失敗:', err);
    }
  };

  // 格式化時間
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 獲取聊天室名稱
  const getRoomName = () => {
    if (room.name) return room.name;
    
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.userId !== currentUserId);
      if (otherParticipant?.user) {
        return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }
    
    return '聊天室';
  };

  // 初始化聊天室
  useEffect(() => {
    if (room.id) {
      fetchMessages(room.id);
      joinChatRoom(room.id);
      markMessagesAsRead(room.id);
    }
  }, [room.id, fetchMessages, joinChatRoom, markMessagesAsRead]);

  // 自動滾動
  useEffect(() => {
    scrollToBottom();
  }, [roomMessages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* 聊天室標題 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {getRoomName()}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? '已連接' : '未連接'}</span>
            <span>•</span>
            <span>{room.participants.length} 位參與者</span>
          </div>
        </div>
        
        {room.unreadCount > 0 && (
          <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {room.unreadCount}
          </div>
        )}
      </div>

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && roomMessages.length === 0 && (
          <div className="text-center text-gray-500">載入中...</div>
        )}
        
        {error && (
          <div className="text-center text-red-500 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {roomMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
          />
        ))}
        
        {roomMessages.length === 0 && !loading && (
          <div className="text-center text-gray-500">
            還沒有訊息，開始聊天吧！
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 訊息輸入 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入訊息..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            發送
          </button>
        </div>
      </form>
    </div>
  );
};

// 訊息氣泡組件
interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('zh-TW', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
        {!isOwn && message.sender && (
          <div className="text-xs text-gray-500 mb-1">
            {message.sender.firstName} {message.sender.lastName}
          </div>
        )}
        
        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
          {formatTime(message.createdAt)}
          {isOwn && (
            <span className="ml-1">
              {message.isRead ? '已讀' : '已送達'}
            </span>
          )}
        </div>
      </div>
      
      {!isOwn && message.sender?.avatarUrl && (
        <div className="order-1 mr-2">
          <img
            src={message.sender.avatarUrl}
            alt={`${message.sender.firstName} ${message.sender.lastName}`}
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
    </div>
  );
};