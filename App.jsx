import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  RefreshCw,
  Clock,
  Send,
  Trash2,
  Info,
  Moon,
  Heart,
  Coffee,
  LogIn,
  LogOut,
  Smartphone
} from 'lucide-react';

// 注意：実際に動かす時は、Google Cloudで取得したクライアントIDをここに入れます
const CLIENT_ID = "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com";

const App = () => {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDays, setSelectedDays] = useState({}); 
  const [activeMode, setActiveMode] = useState('night'); 
  const [isSyncing, setIsSyncing] = useState(false); 
  const [notification, setNotification] = useState(null); 
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  // シフトの定義
  const SHIFT_TYPES = {
    night: { 
      label: '夜①', 
      time: '17:00 - 翌09:00', 
      color: 'bg-indigo-600', 
      lightColor: 'bg-indigo-50', 
      textColor: 'text-indigo-600',
      icon: <Moon size={14} /> 
    },
    desired: { 
      label: '希望休', 
      time: '終日', 
      color: 'bg-red-500', 
      lightColor: 'bg-red-50', 
      textColor: 'text-red-500',
      icon: <Heart size={14} /> 
    },
    off: { 
      label: '休み', 
      time: '終日', 
      color: 'bg-emerald-500', 
      lightColor: 'bg-emerald-50', 
      textColor: 'text-emerald-500',
      icon: <Coffee size={14} /> 
    }
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days = [];
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateStr: dateStr, isToday: new Date().toDateString() === new Date(year, month, d).toDateString() });
    }
    return days;
  }, [currentDate]);

  const handleGoogleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsGoogleConnected(!isGoogleConnected);
      setIsSyncing(false);
      setNotification(isGoogleConnected ? "Google連携を解除しました" : "Googleカレンダーと連携しました");
      setTimeout(() => setNotification(null), 3000);
    }, 1000);
  };

  const handleDateClick = (dateStr) => {
    if (!dateStr) return;
    setSelectedDays(prev => {
      const newDays = { ...prev };
      if (newDays[dateStr] === activeMode) { delete newDays[dateStr]; }
      else { newDays[dateStr] = activeMode; }
      return newDays;
    });
  };

  const handleBulkRegister = async () => {
    if (!isGoogleConnected) {
      setNotification("先にGoogle連携を完了させてください");
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setNotification(`${Object.keys(selectedDays).length}件のシフトをカレンダーに登録しました！`);
    setSelectedDays({});
    setIsSyncing(false);
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-3 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* ヘッダー */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg shadow-slate-200">
              <CalendarIcon size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">瞬速シフト連携</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shift Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleGoogleConnect}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isGoogleConnected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {isGoogleConnected ? <CheckCircle2 size={16} /> : <LogIn size={16} />}
              {isGoogleConnected ? '連携済み' : 'Google連携'}
            </button>
          </div>
        </header>

        {/* 月切り替え */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronLeft size={20} /></button>
          <span className="font-black text-lg">{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月</span>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><ChevronRight size={20} /></button>
        </div>

        {/* 入力モード選択 */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Object.entries(SHIFT_TYPES).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setActiveMode(key)}
              className={`
                flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-bold transition-all border-2
                ${activeMode === key ? `${config.color} border-transparent text-white shadow-xl scale-[1.03]` : `bg-white border-slate-100 text-slate-400`}
              `}
            >
              {config.icon}
              <span className="text-[11px]">{config.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-7 bg-slate-50/80 border-b border-slate-100">
                {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                  <div key={day} className={`py-3 text-center text-[10px] font-black ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-slate-400'}`}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-px bg-slate-100">
                {calendarData.map((item, index) => {
                  const typeKey = item ? selectedDays[item.dateStr] : null;
                  const config = typeKey ? SHIFT_TYPES[typeKey] : null;
                  return (
                    <div 
                      key={index} 
                      onClick={() => item && handleDateClick(item.dateStr)}
                      className={`relative h-20 md:h-28 bg-white transition-all cursor-pointer p-1 md:p-2 ${!item ? 'bg-slate-50/30' : 'active:bg-slate-100'} ${config ? config.lightColor : ''}`}
                    >
                      {item && (
                        <>
                          <span className={`inline-flex items-center justify-center w-6 h-6 text-[11px] font-bold rounded-full ${item.isToday ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>{item.day}</span>
                          {config && (
                            <div className="mt-1 animate-in fade-in zoom-in duration-200">
                              <div className={`${config.color} text-white text-[9px] py-1 px-1.5 rounded-md font-black text-center shadow-sm`}>
                                {config.label}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* サイドパネル */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-200 flex flex-col min-h-[300px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                <h3 className="font-black text-xs text-slate-500 uppercase tracking-widest">Selected List</h3>
                <span className="bg-slate-100 text-slate-900 text-[10px] px-2 py-0.5 rounded-full font-black">{Object.keys(selectedDays).length}</span>
              </div>
              
              <div className="flex-grow overflow-y-auto max-h-[300px] space-y-2 custom-scrollbar">
                {Object.keys(selectedDays).length > 0 ? (
                  Object.entries(selectedDays).sort().map(([date, type]) => (
                    <div key={date} className={`p-3 rounded-xl flex items-center justify-between border-l-4 ${SHIFT_TYPES[type].color} bg-slate-50`}>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400">{date.replace(/-/g, '/')}</p>
                        <p className="text-[11px] font-black text-slate-800">{SHIFT_TYPES[type].label} <span className="text-[9px] font-medium opacity-60">({SHIFT_TYPES[type].time})</span></p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDateClick(date); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-20">
                    <Smartphone size={32} className="mx-auto mb-2" />
                    <p className="text-[10px] font-bold">カレンダーをタップして<br/>シフトを入力してください</p>
                  </div>
                )}
              </div>

              <button 
                disabled={Object.keys(selectedDays).length === 0 || isSyncing}
                onClick={handleBulkRegister}
                className={`
                  w-full mt-4 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95
                  ${Object.keys(selectedDays).length > 0 && !isSyncing ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                `}
              >
                {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <><Send size={16} />一括登録を実行</>}
              </button>
            </div>

            {notification && (
              <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 shadow-2xl">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <p className="text-[11px] font-bold leading-tight">{notification}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;