'use client';

import { useState } from 'react';
import { Button, Input } from '@/components';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores';
import { TAIWAN_CITIES } from '@/constants/locations';

interface CreatePartnerRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  city: string;
  district: string;
  location: string;
}

export function CreatePartnerRequestModal({
  isOpen,
  onClose,
  onSuccess
}: CreatePartnerRequestModalProps) {
  const { user: currentUser } = useAuthStore();

  // Form states
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [specialReq, setSpecialReq] = useState('');

  // New Criteria States
  const defaultNtrp = currentUser?.profile?.ntrpLevel;
  const [ntrpMin, setNtrpMin] = useState(defaultNtrp ? Math.max(1.0, defaultNtrp - 0.5) : 3.0);
  const [ntrpMax, setNtrpMax] = useState(defaultNtrp ? Math.min(7.0, defaultNtrp + 0.5) : 4.0);
  const [playTypes, setPlayTypes] = useState<string[]>(['rally']);

  // New Slot State
  const [newDay, setNewDay] = useState('週一');
  const [newStartTime, setNewStartTime] = useState('18:00');
  const [newEndTime, setNewEndTime] = useState('20:00');
  const [newCity, setNewCity] = useState('');
  const [newDistrict, setNewDistrict] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const daysOptions = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  // Helper functions
  const addSlot = () => {
    if (!newCity || !newDistrict) {
      toast.error('請選擇地區');
      return;
    }
    // Basic time validation
    if (newStartTime >= newEndTime) {
      toast.error('開始時間必須早於結束時間');
      return;
    }

    setSlots(prev => [...prev, {
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      city: newCity,
      district: newDistrict,
      location: newLocation.trim()
    }]);

    toast.success('已新增時段');
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const togglePlayType = (type: string) => {
    setPlayTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const resetForm = () => {
    setSlots([]);
    setSpecialReq('');
    setNtrpMin(3.0);
    setNtrpMax(4.0);
    setPlayTypes(['rally']);
    setNewDay('週一');
    setNewStartTime('18:00');
    setNewEndTime('20:00');
    setNewCity('');
    setNewDistrict('');
    setNewLocation('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    // Validation
    if (slots.length === 0) {
      toast.error('請至少新增一個偏好時段');
      return;
    }
    if (playTypes.length === 0) {
      toast.error('請至少選擇一種打球類型');
      return;
    }

    try {
      const scheduledAtInput = document.getElementById('scheduled_at_new') as HTMLInputElement;
      const scheduledAt = scheduledAtInput?.value;

      const requestData = {
        participantIds: [currentUser?.id],
        matchType: 'practice',
        // Optional specific scheduled time, otherwise undefined (general availability)
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
        availabilitySlots: slots.map(s => ({
          day: s.day,
          startTime: s.startTime,
          endTime: s.endTime,
          location: `${s.city}${s.district} ${s.location}`.trim()
        })),
        specialRequirements: specialReq || undefined,
        ntrpMin,
        ntrpMax,
        playTypes,
      };

      await apiClient.post('/partners/create', requestData);
      toast.success('找球友訊息已發布！');

      resetForm();
      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || '發布失敗');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-900">發布找球友訊息</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">

          {/* Availability Slots Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              時間與地點 <span className="text-red-500">*</span>
            </label>

            {/* Added Slots List */}
            {slots.length > 0 && (
              <div className="mb-4 space-y-2">
                {slots.map((slot, index) => (
                  <div key={index} className="flex flex-wrap items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm gap-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-100">{slot.day}</span>
                      <span className="text-emerald-700 font-mono">{slot.startTime} ~ {slot.endTime}</span>
                      <span className="text-emerald-800">{slot.city}{slot.district}</span>
                      {slot.location && <span className="text-gray-500">({slot.location})</span>}
                    </div>
                    <button
                      onClick={() => removeSlot(index)}
                      className="text-emerald-400 hover:text-red-500 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Slot Form */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Day & Time */}
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">星期</span>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                  >
                    {daysOptions.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-gray-500">時段</span>
                  <div className="flex items-center space-x-1">
                    <input
                      type="time"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-2 text-sm"
                    />
                    <span>-</span>
                    <input
                      type="time"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full border border-gray-300 rounded px-1 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Region */}
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newCity}
                  onChange={(e) => {
                    setNewCity(e.target.value);
                    setNewDistrict('');
                  }}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm"
                >
                  <option value="">選擇縣市</option>
                  {Object.keys(TAIWAN_CITIES).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                  disabled={!newCity}
                  className="w-full border border-gray-300 rounded px-2 py-2 text-sm disabled:bg-gray-100"
                >
                  <option value="">選擇區域</option>
                  {newCity && TAIWAN_CITIES[newCity]?.map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>

              {/* Location Detail & Button */}
              <div className="flex gap-2">
                <Input
                  placeholder="詳細地點 (例如: 新莊網球場)"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="bg-white flex-1"
                />
                <Button
                  type="button"
                  onClick={addSlot}
                  className="shrink-0 bg-gray-600 hover:bg-gray-700 w-20"
                >
                  新增
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NTRP Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                建議 NTRP 程度 ({ntrpMin} - {ntrpMax})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1.0"
                  max="7.0"
                  step="0.5"
                  value={ntrpMin}
                  onChange={(e) => setNtrpMin(parseFloat(e.target.value))}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 font-mono text-center"
                />
                <span className="text-gray-400">至</span>
                <input
                  type="number"
                  min="1.0"
                  max="7.0"
                  step="0.5"
                  value={ntrpMax}
                  onChange={(e) => setNtrpMax(parseFloat(e.target.value))}
                  className="w-20 border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 font-mono text-center"
                />
              </div>
            </div>

            {/* Play Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                尋找類型 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 mt-2">
                {[
                  { val: 'rally', label: '拉球' },
                  { val: 'singles', label: '單打' },
                  { val: 'doubles', label: '雙打' }
                ].map((type) => (
                  <label key={type.val} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playTypes.includes(type.val)}
                      onChange={() => togglePlayType(type.val)}
                      className="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-300 focus:ring focus:ring-emerald-200 focus:ring-opacity-50 mr-2"
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備註說明
            </label>
            <textarea
              value={specialReq}
              onChange={(e) => setSpecialReq(e.target.value)}
              placeholder="例如：希望找初學者陪練、想練反拍、需要有教學經驗的夥伴等..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Scheduled Date/Time - Optional specific time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              (選填) 這次特定的打球時間
            </label>
            <input
              type="datetime-local"
              id="scheduled_at_new"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              如果這是一個特定日期的邀約，請在此選擇。若只是尋找一般球友，可留空。
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={handleClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            >
              取消
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              disabled={slots.length === 0}
            >
              確認發布
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}