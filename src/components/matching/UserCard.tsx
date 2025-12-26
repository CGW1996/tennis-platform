'use client';

import React from 'react';
import Image from 'next/image';
import { MapPinIcon, StarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { User } from '@/types/user';
import { MatchingFactors, MatchingUser } from '@/types/matching';

interface UserCardProps {
  user: User | MatchingUser;
  score: number;
  factors: MatchingFactors;
}

const UserCard: React.FC<UserCardProps> = ({ user, score, factors }) => {
  // 統一提取顯示資料
  const isMatchingUser = (u: User | MatchingUser): u is MatchingUser => !('profile' in u);

  const getDisplayData = () => {
    if (isMatchingUser(user)) {
      return {
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' '),
        avatarUrl: user.avatarUrl,
        age: user.age,
        ntrpLevel: user.ntrpLevel,
        playingStyle: user.playingStyle,
        playingFrequency: user.playingFrequency,
        preferredTimes: user.preferredTimes,
        bio: user.bio,
        hasLocation: !!user.location,
        distance: user.distance ?? factors.distance,
      };
    }
    return {
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      avatarUrl: user.profile?.avatarUrl,
      age: user.profile?.birthDate ? calculateAge(user.profile.birthDate) : undefined,
      ntrpLevel: user.profile?.ntrpLevel,
      playingStyle: user.profile?.playingStyle,
      playingFrequency: user.profile?.playingFrequency,
      preferredTimes: user.profile?.preferredTimes,
      bio: user.profile?.bio,
      hasLocation: !!user.profile?.location,
      distance: factors.distance,
    };
  };

  const displayData = getDisplayData();

  const {
    firstName,
    lastName,
    avatarUrl,
    age,
    ntrpLevel,
    playingStyle,
    playingFrequency,
    preferredTimes,
    bio,
    hasLocation,
    distance,
  } = displayData;

  // 計算年齡
  function calculateAge(birthDateStr: string) {
    const today = new Date();
    const birth = new Date(birthDateStr);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 格式化打球風格
  const formatPlayingStyle = (style: string) => {
    const styles: { [key: string]: string } = {
      aggressive: '攻擊型',
      defensive: '防守型',
      'all-court': '全場型',
    };
    return styles[style] || style;
  };

  // 格式化打球頻率
  const formatPlayingFrequency = (frequency: string) => {
    const frequencies: { [key: string]: string } = {
      casual: '休閒',
      regular: '定期',
      competitive: '競技',
    };
    return frequencies[frequency] || frequency;
  };

  // 格式化偏好時間
  const formatPreferredTimes = (times: string[]) => {
    const timeMap: { [key: string]: string } = {
      morning: '早上',
      afternoon: '下午',
      evening: '晚上',
    };
    return times.map(time => timeMap[time] || time).join('、');
  };

  // 獲取配對分數顏色
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl overflow-hidden shadow-lg">
      {/* 頭像區域 */}
      <div className="relative h-48 bg-gradient-to-br from-primary-400 to-primary-600">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={`${firstName} ${lastName}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">
                {firstName?.[0]}{lastName?.[0]}
              </span>
            </div>
          </div>
        )}

        {/* 配對分數 */}
        <div className="absolute top-4 right-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
            {Math.round(score * 100)}% 匹配
          </div>
        </div>
      </div>

      {/* 用戶資訊 */}
      <div className="p-4 space-y-3">
        {/* 基本資訊 */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {firstName} {lastName}
            {age !== undefined && (
              <span className="text-base font-normal text-gray-600 ml-2">
                {age}歲
              </span>
            )}
          </h3>

          {/* NTRP 等級 */}
          {ntrpLevel && (
            <div className="flex items-center mt-1">
              <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm text-gray-600">
                NTRP {ntrpLevel}
              </span>
            </div>
          )}
        </div>

        {/* 位置資訊 */}
        {hasLocation && (
          <div className="flex items-center text-sm text-gray-600">
            <MapPinIcon className="w-4 h-4 mr-1" />
            <span>距離約 {Math.round((1 - distance) * 20)} 公里</span>
          </div>
        )}

        {/* 打球資訊 */}
        <div className="space-y-2">
          {playingStyle && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">打球風格:</span>
              <span className="font-medium">{formatPlayingStyle(playingStyle)}</span>
            </div>
          )}

          {playingFrequency && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">打球頻率:</span>
              <span className="font-medium">{formatPlayingFrequency(playingFrequency)}</span>
            </div>
          )}

          {preferredTimes && preferredTimes.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">偏好時間:</span>
              <span className="font-medium">{formatPreferredTimes(preferredTimes)}</span>
            </div>
          )}
        </div>

        {/* 個人簡介 */}
        {bio && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-700 line-clamp-2">
              {bio}
            </p>
          </div>
        )}

        {/* 配對因子 */}
        <div className="pt-2 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="text-gray-600">技術</div>
              <div className="font-semibold text-primary-600">
                {Math.round(factors.skillLevel * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">時間</div>
              <div className="font-semibold text-primary-600">
                {Math.round(factors.timeCompatibility * 100)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-600">風格</div>
              <div className="font-semibold text-primary-600">
                {Math.round(factors.playingStyle * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;