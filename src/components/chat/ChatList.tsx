'use client';

import React from 'react';
import { ChatRoom } from '@/types/chat';

interface ChatListProps {
  chatRooms: ChatRoom[];
  selectedRoomId?: string;
  currentUserId: string;
  onRoomSelect: (room: ChatRoom) => void;
  onCreateRoom: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  chatRooms,
  selectedRoomId,
  currentUserId,
  onRoomSelect,
  onCreateRoom
}) => {
  // 獲取聊天室顯示名稱
  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.name) return room.name;
    
    if (room.type === 'direct') {
      const otherParticipant = room.participants.find(p => p.userId !== currentUserId);
      if (otherParticipant?.user) {
        return `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`;
      }
    }
    
    return '聊天室';
  };

  // 獲取最後訊息預覽
  const getLastMessagePreview = (room: ChatRoom) => {
    if (!room.lastMessage) return '還沒有訊息';
    
    const isOwn = room.lastMessage.senderId === currentUserId;
    const senderName = isOwn ? '我' : room.lastMessage.sender?.firstName || '對方';
    
    return `${senderName}: ${room.lastMessage.content}`;
  };

  // 格式化時間
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-TW', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('zh-TW', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('zh-TW', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* 標題和新建按鈕 */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">聊天</h1>
          <button
            onClick={onCreateRoom}
            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            title="新建聊天"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 聊天室列表 */}
      <div className="flex-1 overflow-y-auto">
        {chatRooms.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">還沒有聊天記錄</p>
            <button
              onClick={onCreateRoom}
              className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              開始新聊天
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chatRooms.map((room) => (
              <ChatRoomItem
                key={room.id}
                room={room}
                isSelected={room.id === selectedRoomId}
                displayName={getRoomDisplayName(room)}
                lastMessagePreview={getLastMessagePreview(room)}
                lastMessageTime={room.lastMessage ? formatTime(room.lastMessage.createdAt) : formatTime(room.updatedAt)}
                onClick={() => onRoomSelect(room)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 聊天室項目組件
interface ChatRoomItemProps {
  room: ChatRoom;
  isSelected: boolean;
  displayName: string;
  lastMessagePreview: string;
  lastMessageTime: string;
  onClick: () => void;
}

const ChatRoomItem: React.FC<ChatRoomItemProps> = ({
  room,
  isSelected,
  displayName,
  lastMessagePreview,
  lastMessageTime,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-50 border-r-2 border-blue-500' 
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* 頭像或圖標 */}
        <div className="flex-shrink-0">
          {room.type === 'direct' ? (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          ) : (
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* 聊天室信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium truncate ${
              isSelected ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {displayName}
            </h3>
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {lastMessageTime}
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 truncate">
              {lastMessagePreview}
            </p>
            
            {room.unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center ml-2 flex-shrink-0">
                {room.unreadCount > 99 ? '99+' : room.unreadCount}
              </div>
            )}
          </div>
          
          {/* 聊天室類型標籤 */}
          <div className="flex items-center mt-2 space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              room.type === 'direct' 
                ? 'bg-green-100 text-green-800'
                : room.type === 'group'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {room.type === 'direct' ? '私聊' : room.type === 'group' ? '群組' : '配對'}
            </span>
            
            {room.participants.length > 2 && (
              <span className="text-xs text-gray-500">
                {room.participants.length} 人
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};