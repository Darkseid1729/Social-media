import admin from 'firebase-admin';

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Requires GOOGLE_APPLICATION_CREDENTIALS env var pointing to service account JSON
 * OR FIREBASE_SERVICE_ACCOUNT env var with the JSON content
 */
export const initializeFirebase = () => {
  if (firebaseInitialized) return;

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    } else {
      console.warn(
        '⚠️  Firebase not configured. Push notifications will be disabled.\n' +
        'Set FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS env var.'
      );
      return;
    }

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error.message);
  }
};

/**
 * Send push notification to specific FCM tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} notification - { title, body }
 * @param {object} data - Additional data payload (e.g., chatId)
 */
export const sendPushNotification = async (tokens, notification, data = {}) => {
  if (!firebaseInitialized || !tokens || tokens.length === 0) return;

  // Convert all data values to strings (FCM requirement)
  const stringData = {};
  for (const [key, value] of Object.entries(data)) {
    stringData[key] = String(value ?? '');
  }

  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: stringData,
    android: {
      priority: 'high',
      notification: {
        channelId: 'chat_messages',
        sound: 'default',
        clickAction: 'FLUTTER_NOTIFICATION_CLICK',
      },
    },
  };

  // Send to each token individually (multicast deprecated in newer SDK)
  const results = await Promise.allSettled(
    tokens.map((token) =>
      admin.messaging().send({ ...message, token })
    )
  );

  // Collect invalid tokens to clean up
  const invalidTokens = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const errorCode = result.reason?.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        invalidTokens.push(tokens[index]);
      }
    }
  });

  return { invalidTokens };
};

/**
 * Send message notification to a user
 * @param {string} userId - User ID to send notification to
 * @param {string} senderName - Name of the message sender
 * @param {string} messageContent - Message text
 * @param {string} chatId - Chat ID for navigation
 */
export const sendMessageNotification = async (userId, senderName, messageContent, chatId) => {
  if (!firebaseInitialized) return;

  try {
    // Dynamic import to avoid circular dependency
    const { User } = await import('../models/user.js');
    
    const user = await User.findById(userId).select('fcmTokens');
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    const tokens = user.fcmTokens.map((t) => t.token);
    const truncatedMessage = messageContent?.length > 100
      ? messageContent.substring(0, 100) + '...'
      : messageContent || 'Sent an attachment';

    const result = await sendPushNotification(
      tokens,
      {
        title: senderName,
        body: truncatedMessage,
      },
      {
        chatId,
        senderName,
        type: 'chat_message',
      }
    );

    // Clean up invalid tokens
    if (result?.invalidTokens?.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: { token: { $in: result.invalidTokens } } },
      });
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

export default {
  initializeFirebase,
  sendPushNotification,
  sendMessageNotification,
};
