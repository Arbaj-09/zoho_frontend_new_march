"use client";

import { useEffect, useMemo, useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, RefreshCw, X, User, Calendar, Clock } from 'lucide-react';

import { backendApi } from '@/services/api';
import { listenForegroundMessages } from '@/lib/web_push';
import webSocketService from '@/services/websocketService';

export default function Topbar({ tabs, activeTabKey, onTabClick }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);

  const userId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user_data');
      const obj = raw ? JSON.parse(raw) : null;
      return obj?.id ?? null;
    } catch (_e) {
      return null;
    }
  }, []);

  const unread = useMemo(() => {
    if (!items || items.length === 0) return 0;
    return items.filter((n) => !n.readAt).length;
  }, [items]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await backendApi.put(`/notifications/${notificationId}/read`);
      refresh();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Show error but continue
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await backendApi.delete(`/notifications/${notificationId}`);
      refresh();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Show error but continue
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (unread === 0) return;
    setMarkingAll(true);
    try {
      await backendApi.put(`/notifications/mark-all-read?employeeId=${userId}`);
      refresh();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      // Show error but continue
    } finally {
      setMarkingAll(false);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    try {
      await backendApi.delete(`/notifications?employeeId=${userId}`);
      refresh();
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
      // Show error but continue
    }
  };

  async function refresh() {
    if (userId == null) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch more notifications to get accurate count
      const page = await backendApi.get(`/notifications?employeeId=${encodeURIComponent(userId)}&page=0&size=50`);
      const content = page?.content ?? [];
      setItems(content);
      setTotalCount(page?.totalElements || content.length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Server connection failed');
      // Set empty state on error to prevent infinite loading
      setItems([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // 🔥 CRITICAL: Initialize WebSocket connection first
    async function initSocket() {
      try {
        await webSocketService.connect();
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
      }
    }

    initSocket();
    
    // Initial refresh and polling fallback
    refresh();
    const t = setInterval(refresh, 30000);
    
    const handleAdminNotification = (data) => {
      console.log('Received admin notification:', data);
      refresh(); // Real-time update - only once!
    };
    
    webSocketService.addEventListener('adminNotification', handleAdminNotification);
    
    return () => {
      clearInterval(t);
      webSocketService.removeEventListener('adminNotification', handleAdminNotification);
    };
  }, [userId]);

  useEffect(() => {
    let unsub = null;
    (async () => {
      unsub = await listenForegroundMessages(() => {
        refresh();
      });
    })();
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [userId]);

  return (
    <div className="border-b border-slate-200/70 bg-white/80 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => onTabClick(tab)}
              className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  activeTabKey === tab.key
                    ? 'border-indigo-600 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => {
              setOpen((v) => !v);
            }}
            className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100 transition-all duration-200 hover:scale-105"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 min-w-[20px] h-5 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-5 text-white shadow-lg">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {open && (
            <>
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" 
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-[420px] max-h-[80vh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 animate-in slide-in-from-top-2 duration-200 flex flex-col">
                {/* Header */}
                <div className="bg-slate-800 text-white p-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Bell className="w-5 h-5" />
                        {unread > 0 && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">Notifications</div>
                        <div className="text-xs opacity-90">
                          {unread} unread • {totalCount} total
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={refresh}
                      disabled={loading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    {unread > 0 && (
                      <button
                        onClick={markAllAsRead}
                        disabled={markingAll}
                        className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCheck className={`w-3 h-3 ${markingAll ? 'animate-pulse' : ''}`} />
                        Mark All Read
                      </button>
                    )}
                    {items.length > 0 && (
                      <button
                        onClick={deleteAllNotifications}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/80 hover:bg-red-600 rounded-lg text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear All
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications List - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
                      <div className="text-sm text-slate-500">Loading notifications...</div>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <X className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="text-sm font-medium text-slate-900 mb-1">Connection Error</div>
                      <div className="text-xs text-slate-500 mb-4">{error}</div>
                      <button
                        onClick={refresh}
                        className="px-4 py-2 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Bell className="w-6 h-6 text-slate-400" />
                      </div>
                      <div className="text-sm font-medium text-slate-900 mb-1">No notifications</div>
                      <div className="text-xs text-slate-500">You're all caught up!</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {items.map((n) => {
                        let notificationData = {};
                        try {
                          if (n.dataJson) {
                            notificationData = JSON.parse(n.dataJson);
                          }
                        } catch (e) {
                          console.warn('Failed to parse notification data:', e);
                        }

                        const isTaskStatusUpdate = n.type === 'TASK_STATUS_UPDATED';
                        const isTaskAssigned = n.type === 'TASK_ASSIGNED';
                        const isUnread = !n.readAt;

                        return (
                          <div
                            key={n.id}
                            className={`relative group transition-all duration-200 ${
                              isUnread ? 'bg-blue-50' : 'hover:bg-slate-50'
                            }`}
                          >
                            {/* Unread indicator */}
                            {isUnread && (
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            )}
                            
                            <div className="p-4">
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isTaskStatusUpdate ? 'bg-blue-100 text-blue-600' : 
                                    isTaskAssigned ? 'bg-green-100 text-green-600' : 
                                    'bg-slate-100 text-slate-600'
                                  }`}>
                                    {isTaskStatusUpdate ? <RefreshCw className="w-4 h-4" /> :
                                     isTaskAssigned ? <User className="w-4 h-4" /> :
                                     <Bell className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-slate-900 text-sm truncate">
                                      {n.title}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                      <Clock className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">
                                        {new Date(n.createdAt).toLocaleDateString()} • 
                                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Action buttons */}
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  {isUnread && (
                                    <button
                                      onClick={() => markAsRead(n.id)}
                                      className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="w-3 h-3 text-slate-600" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(n.id)}
                                    className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              </div>

                              {/* Task Details */}
                              {(isTaskStatusUpdate || isTaskAssigned) && notificationData ? (
                                <div className="ml-11 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span className="text-xs text-slate-500">Customer:</span>
                                      <span className="text-xs font-medium text-slate-900 truncate">
                                        {notificationData.clientName || 'Unknown'}
                                      </span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                      notificationData.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      notificationData.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                      notificationData.status === 'DELAYED' ? 'bg-yellow-100 text-yellow-800' :
                                      notificationData.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                      notificationData.status === 'INQUIRY' ? 'bg-purple-100 text-purple-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {notificationData.status}
                                    </span>
                                  </div>
                                  
                                  {notificationData.clientAddress && (
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span className="text-xs text-slate-500">Address:</span>
                                      <span className="text-xs text-slate-700 truncate">
                                        {notificationData.clientAddress}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {notificationData.updatedBy && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                      <span className="text-xs text-slate-500">Updated by:</span>
                                      <span className="text-xs font-medium text-slate-900 truncate">
                                        {notificationData.updatedBy}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="ml-11">
                                  <div className="text-sm text-slate-600">{n.body}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
