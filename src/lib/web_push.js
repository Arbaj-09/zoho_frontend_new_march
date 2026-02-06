import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

import { getFirebaseApp } from './firebase';
import { backendApi } from '@/services/api';

export async function ensureServiceWorker() {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;

  try {
    const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error('❌ Service Worker register failed:', e);
    return null;
  }
}

export async function registerWebFcmToken({ employeeId }) {
  if (typeof window === 'undefined') return null;

  // Check if we already have a valid token for this employee
  const storedToken = sessionStorage.getItem('fcm_token');
  const storedEmployeeId = sessionStorage.getItem('fcm_employee_id');
  
  if (storedToken && storedEmployeeId === employeeId.toString()) {
    console.log(`🔑 FCM Token (${employeeId}) [cached]:`, storedToken);
    // Still send to backend to ensure it's registered
    try {
      await backendApi.post('/notifications/token', {
        employeeId,
        platform: 'WEB',
        token: storedToken,
      });
    } catch (e) {
      console.error('❌ Failed to re-register cached token:', e);
    }
    return storedToken;
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn('❌ FCM not supported in this browser');
    return null;
  }

  if (!('Notification' in window)) return null;

  if (Notification.permission === 'denied') {
    console.warn('❌ Notifications blocked (Notification.permission=denied)');
    return null;
  }

  const permission =
    Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;

  if (permission !== 'granted') {
    console.warn('❌ Notification permission not granted:', permission);
    return null;
  }

  const registration = await ensureServiceWorker();
  if (!registration) return null;

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.error('❌ Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY');
    return null;
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  }).catch((e) => {
    console.error('❌ getToken failed:', e);
    return null;
  });

  if (!token) return null;

  console.log(`🔑 FCM Token (${employeeId}):`, token);

  // Store token in sessionStorage to persist across refreshes
  if (typeof window !== 'undefined' && token) {
    sessionStorage.setItem('fcm_token', token);
    sessionStorage.setItem('fcm_employee_id', employeeId.toString());
  }

  await backendApi.post('/notifications/token', {
    employeeId,
    platform: 'WEB',
    token,
  });

  return token;
}

export async function listenForegroundMessages(onMsg) {
  const supported = await isSupported().catch(() => false);
  if (!supported) return () => {};

  const app = getFirebaseApp();
  const messaging = getMessaging(app);

  return onMessage(messaging, (payload) => {
    console.log('✅ Foreground message:', payload);
    onMsg(payload);
  });
}
