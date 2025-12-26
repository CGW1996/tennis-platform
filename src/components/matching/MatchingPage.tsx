'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import CardStack from './CardStack';
import MatchSuccessModal from './MatchSuccessModal';
import { MatchingResult, CardMatchResult } from '@/types/matching';
import { User } from '@/types/user';
import { useMatchingApi } from '@/hooks/useMatchingApi';

const MatchingPage: React.FC = () => {
  const [matches, setMatches] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | MatchingResult['user'] | null>(null);
  const [matchResult, setMatchResult] = useState<CardMatchResult | null>(null);

  const { getRandomMatches, processCardAction } = useMatchingApi();

  // 載入隨機配對
  const loadRandomMatches = async () => {
    try {
      setLoading(true);
      const response = await getRandomMatches(10);
      setMatches(response.matches);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('載入配對失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 處理卡片動作
  const handleCardAction = async (userId: string, action: 'like' | 'dislike' | 'skip') => {
    try {
      const result = await processCardAction(userId, action);

      if (result.result.isMatch) {
        // 配對成功
        const matchedUserData = matches.find(m => m.userId === userId)?.user;
        if (matchedUserData) {
          setMatchedUser(matchedUserData);
          setMatchResult(result.result);
          setShowMatchModal(true);
        }
        toast.success('配對成功！🎉');
      } else {
        // 顯示動作結果
        if (action === 'like') {
          toast.success('已表達興趣 💕');
        } else {
          toast('已跳過此用戶');
        }
      }
    } catch (error) {
      console.error('Failed to process card action:', error);
      toast.error('操作失敗，請稍後再試');
    }
  };

  // 開始聊天
  const handleStartChat = () => {
    if (matchResult?.chatRoomId) {
      // 導航到聊天頁面
      window.location.href = `/chat/${matchResult.chatRoomId}`;
    }
    setShowMatchModal(false);
  };

  // 關閉配對成功模態框
  const handleCloseMatchModal = () => {
    setShowMatchModal(false);
    setMatchedUser(null);
    setMatchResult(null);
  };

  // 初始載入
  useEffect(() => {
    loadRandomMatches();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* 頁面標題 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎾 尋找球友
            </h1>
            <p className="text-gray-600">
              滑動卡片找到你的完美球友
            </p>
          </div>
        </div>
      </div>

      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* 操作提示 */}
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>向左滑動跳過</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>向右滑動喜歡</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* 卡片堆疊 */}
          <CardStack
            matches={matches}
            onCardAction={handleCardAction}
            loading={loading}
          />

          {/* 重新載入按鈕 */}
          {!loading && matches.length === 0 && (
            <div className="text-center mt-6">
              <button
                onClick={loadRandomMatches}
                className="btn-primary"
              >
                載入更多球友
              </button>
            </div>
          )}
        </div>

        {/* 功能說明 */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              如何使用抽卡配對？
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">1</span>
                </div>
                <p>瀏覽推薦的球友卡片，查看他們的資料和配對分數</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">2</span>
                </div>
                <p>向右滑動或點擊愛心表示喜歡，向左滑動或點擊 X 跳過</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-600 text-sm font-semibold">3</span>
                </div>
                <p>當雙方都表示喜歡時，就會配對成功並可以開始聊天</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 配對成功模態框 */}
      {matchedUser && (
        <MatchSuccessModal
          isOpen={showMatchModal}
          onClose={handleCloseMatchModal}
          matchedUser={matchedUser}
          onStartChat={handleStartChat}
        />
      )}
    </div>
  );
};

export default MatchingPage;