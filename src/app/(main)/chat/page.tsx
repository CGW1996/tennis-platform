'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components';
import { ChatList } from '@/components/chat/ChatList';
import { ChatRoom } from '@/components/chat/ChatRoom';
import { useChatApi } from '@/hooks/useChatApi';
import { useAuthStore } from '@/stores';
import { ChatRoom as ChatRoomType, CreateChatRoomRequest } from '@/types/chat';

export default function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get('roomId');

  const { user, token } = useAuthStore();
  const userId = user?.id || '';

  const {
    chatRooms,
    createChatRoom,
    isConnected,
    loading,
    error
  } = useChatApi({ accessToken: token || undefined });

  // Handle URL roomId param
  useEffect(() => {
    if (roomIdFromUrl && chatRooms.length > 0) {
      const room = chatRooms.find(r => r.id === roomIdFromUrl);
      if (room) {
        setSelectedRoom(room);
      }
    }
  }, [roomIdFromUrl, chatRooms]);

  const handleRoomSelect = (room: ChatRoomType) => {
    setSelectedRoom(room);
  };

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleCreateRoomSubmit = async (request: CreateChatRoomRequest) => {
    try {
      const newRoom = await createChatRoom(request);
      setSelectedRoom(newRoom);
      setShowCreateModal(false);
    } catch (err) {
      console.error('創建聊天室失敗:', err);
    }
  };

  return (
    <MainLayout>
      <div className="h-full flex bg-gray-100">
        {/* 聊天室列表 */}
        <ChatList
          chatRooms={chatRooms}
          selectedRoomId={selectedRoom?.id}
          currentUserId={userId}
          onRoomSelect={handleRoomSelect}
          onCreateRoom={handleCreateRoom}
        />

        {/* 聊天室內容 */}
        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <ChatRoom
              room={selectedRoom}
              currentUserId={userId}
              accessToken={token || ''}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">選擇聊天室</h2>
                <p className="text-gray-500 mb-4">從左側選擇一個聊天室開始對話</p>
                <button
                  onClick={handleCreateRoom}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  開始新聊天
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 創建聊天室模態框 */}
        {showCreateModal && (
          <CreateChatRoomModal
            onSubmit={handleCreateRoomSubmit}
            onClose={() => setShowCreateModal(false)}
            loading={loading}
          />
        )}

        {/* 連接狀態指示器 */}
        <div className="fixed bottom-4 right-4">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${isConnected
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
            }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span>{isConnected ? '已連接' : '未連接'}</span>
          </div>
        </div>

        {/* 錯誤提示 */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// 創建聊天室模態框組件
interface CreateChatRoomModalProps {
  onSubmit: (request: CreateChatRoomRequest) => void;
  onClose: () => void;
  loading: boolean;
}

const CreateChatRoomModal: React.FC<CreateChatRoomModalProps> = ({
  onSubmit,
  onClose,
  loading
}) => {
  const [formData, setFormData] = useState({
    type: 'direct' as 'direct' | 'group',
    name: '',
    participantId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.participantId.trim()) return;

    const request: CreateChatRoomRequest = {
      type: formData.type,
      participantIds: [formData.participantId.trim()],
      ...(formData.type === 'group' && formData.name.trim() && { name: formData.name.trim() })
    };

    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">創建聊天室</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              聊天室類型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'direct' | 'group' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="direct">私人聊天</option>
              <option value="group">群組聊天</option>
            </select>
          </div>

          {formData.type === 'group' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                群組名稱
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="輸入群組名稱"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              參與者 ID
            </label>
            <input
              type="text"
              value={formData.participantId}
              onChange={(e) => setFormData(prev => ({ ...prev, participantId: e.target.value }))}
              placeholder="輸入用戶 ID"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              在實際應用中，這裡應該是用戶搜索組件
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.participantId.trim()}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '創建中...' : '創建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};