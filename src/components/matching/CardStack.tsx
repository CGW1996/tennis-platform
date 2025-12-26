'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { HeartIcon, XMarkIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import { MatchingResult } from '@/types/matching';
import UserCard from './UserCard';

interface CardStackProps {
  matches: MatchingResult[];
  onCardAction: (userId: string, action: 'like' | 'dislike' | 'skip') => void;
  onMatchSuccess?: (matchId: string, chatRoomId: string) => void;
  loading?: boolean;
}

const CardStack: React.FC<CardStackProps> = ({
  matches,
  onCardAction,
  onMatchSuccess,
  loading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const currentMatch = matches[currentIndex];

  // 處理拖拽結束
  const handleDragEnd = async (event: any, info: PanInfo) => {
    const threshold = 100;
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    if (Math.abs(offset) > threshold || Math.abs(velocity) > 500) {
      const direction = offset > 0 ? 'right' : 'left';
      const action = direction === 'right' ? 'like' : 'dislike';

      // 動畫卡片飛出
      await controls.start({
        x: direction === 'right' ? 1000 : -1000,
        rotate: direction === 'right' ? 30 : -30,
        opacity: 0,
        transition: { duration: 0.3 },
      });

      // 處理動作
      if (currentMatch) {
        onCardAction(currentMatch.userId, action);
      }

      // 移動到下一張卡片
      nextCard();
    } else {
      // 回彈到原位
      controls.start({
        x: 0,
        rotate: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      });
    }

    setDragDirection(null);
  };

  // 處理拖拽中
  const handleDrag = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    if (Math.abs(offset) > 50) {
      setDragDirection(offset > 0 ? 'right' : 'left');
    } else {
      setDragDirection(null);
    }
  };

  // 移動到下一張卡片
  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1);
    controls.set({ x: 0, rotate: 0, opacity: 1 });
  };

  // 按鈕點擊處理
  const handleButtonAction = async (action: 'like' | 'dislike' | 'skip') => {
    if (!currentMatch) return;

    const direction = action === 'like' ? 'right' : 'left';

    // 動畫卡片飛出
    await controls.start({
      x: direction === 'right' ? 1000 : -1000,
      rotate: direction === 'right' ? 30 : -30,
      opacity: 0,
      transition: { duration: 0.3 },
    });

    // 處理動作
    onCardAction(currentMatch.userId, action);

    // 移動到下一張卡片
    nextCard();
  };

  // 重置動畫控制器
  useEffect(() => {
    controls.set({ x: 0, rotate: 0, opacity: 1 });
  }, [currentIndex, controls]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!matches.length || currentIndex >= matches.length) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="text-6xl mb-4">🎾</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          沒有更多球友了
        </h3>
        <p className="text-gray-600 mb-4">
          試試調整你的搜尋條件，或稍後再來看看
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          重新載入
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* 卡片堆疊 */}
      <div className="relative h-96">
        {/* 背景卡片 */}
        {matches.slice(currentIndex + 1, currentIndex + 3).map((match, index) => (
          <div
            key={match.userId}
            className="absolute inset-0 bg-white rounded-2xl shadow-lg"
            style={{
              transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * 8}px)`,
              zIndex: 10 - index,
              opacity: 1 - (index + 1) * 0.2,
            }}
          >
            <UserCard user={match.user} score={match.score} factors={match.factors} />
          </div>
        ))}

        {/* 當前卡片 */}
        {currentMatch && (
          <motion.div
            ref={cardRef}
            className="absolute inset-0 bg-white rounded-2xl shadow-xl cursor-grab active:cursor-grabbing"
            style={{ zIndex: 20 }}
            animate={controls}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.05 }}
          >
            {/* 拖拽指示器 */}
            {dragDirection && (
              <div
                className={`absolute inset-0 rounded-2xl flex items-center justify-center ${dragDirection === 'right'
                  ? 'bg-green-500 bg-opacity-20'
                  : 'bg-red-500 bg-opacity-20'
                  }`}
                style={{ zIndex: 30 }}
              >
                <div
                  className={`text-6xl font-bold ${dragDirection === 'right' ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                  {dragDirection === 'right' ? '喜歡' : '跳過'}
                </div>
              </div>
            )}

            <UserCard
              user={currentMatch.user}
              score={currentMatch.score}
              factors={currentMatch.factors}
            />
          </motion.div>
        )}
      </div>

      {/* 操作按鈕 */}
      <div className="flex justify-center items-center space-x-6 mt-6">
        <button
          onClick={() => handleButtonAction('dislike')}
          className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          disabled={!currentMatch}
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleButtonAction('skip')}
          className="w-12 h-12 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          disabled={!currentMatch}
        >
          <ChatBubbleLeftIcon className="w-5 h-5" />
        </button>

        <button
          onClick={() => handleButtonAction('like')}
          className="w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          disabled={!currentMatch}
        >
          <HeartIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 進度指示器 */}
      <div className="flex justify-center mt-4">
        <div className="text-sm text-gray-500">
          {currentIndex + 1} / {matches.length}
        </div>
      </div>
    </div>
  );
};

export default CardStack;