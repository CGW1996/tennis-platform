'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { MatchingUser } from '@/types/matching';
import Image from 'next/image';

interface MatchSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: User | MatchingUser;
  onStartChat: () => void;
}

const MatchSuccessModal: React.FC<MatchSuccessModalProps> = ({
  isOpen,
  onClose,
  matchedUser,
  onStartChat,
}) => {
  if (!isOpen) return null;

  const isMatchingUser = (u: User | MatchingUser): u is MatchingUser => !('profile' in u);

  const displayData = isMatchingUser(matchedUser) ? {
    firstName: matchedUser.name.split(' ')[0],
    lastName: matchedUser.name.split(' ').slice(1).join(' '),
    avatarUrl: matchedUser.avatarUrl,
    ntrpLevel: matchedUser.ntrpLevel,
    playingStyle: matchedUser.playingStyle,
  } : {
    firstName: matchedUser.profile?.firstName,
    lastName: matchedUser.profile?.lastName,
    avatarUrl: matchedUser.profile?.avatarUrl,
    ntrpLevel: matchedUser.profile?.ntrpLevel,
    playingStyle: matchedUser.profile?.playingStyle,
  };

  const { firstName, lastName, avatarUrl, ntrpLevel, playingStyle } = displayData;

  const formatPlayingStyle = (style?: string) => {
    if (!style) return '';
    const styles: { [key: string]: string } = {
      aggressive: '攻擊型',
      defensive: '防守型',
      'all-court': '全場型',
    };
    return styles[style] || style;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 模態框 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="relative bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl"
      >
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* 成功動畫 */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-4"
          >
            <HeartIcon className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            配對成功！
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600"
          >
            你們互相喜歡，現在可以開始聊天了
          </motion.p>
        </div>

        {/* 配對用戶資訊 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-6"
        >
          {/* 頭像 */}
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary-100">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={`${firstName} ${lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-600">
                  {firstName?.[0]}{lastName?.[0]}
                </span>
              </div>
            )}
          </div>

          {/* 用戶資訊 */}
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">
              {firstName} {lastName}
            </h3>
            {ntrpLevel && (
              <p className="text-sm text-gray-600">
                NTRP {ntrpLevel}
              </p>
            )}
            {playingStyle && (
              <p className="text-sm text-gray-600">
                {formatPlayingStyle(playingStyle)}
              </p>
            )}
          </div>
        </motion.div>

        {/* 操作按鈕 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <button
            onClick={onStartChat}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <ChatBubbleLeftIcon className="w-5 h-5" />
            <span>開始聊天</span>
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            稍後再說
          </button>
        </motion.div>

        {/* 裝飾性元素 */}
        <div className="absolute -top-2 -left-2 w-4 h-4 bg-pink-400 rounded-full opacity-60"></div>
        <div className="absolute -top-1 -right-3 w-3 h-3 bg-red-400 rounded-full opacity-40"></div>
        <div className="absolute -bottom-2 -left-3 w-5 h-5 bg-pink-300 rounded-full opacity-30"></div>
        <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-red-300 rounded-full opacity-50"></div>
      </motion.div>
    </div>
  );
};

export default MatchSuccessModal;