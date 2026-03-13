// 🔄 Global Activity Broadcasting System
// This creates a shared channel for all CRM activities

export const broadcastActivity = (activity) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel("crm-activities");
      channel.postMessage(activity);
      channel.close();
      
      console.log('📢 [ACTIVITY BUS] Broadcasted activity:', activity);
    }
  } catch (error) {
    console.error('📢 [ACTIVITY BUS] Failed to broadcast activity:', error);
  }
};

// Helper function to create activity objects
export const createActivity = (type, description, performedBy, department, additionalData = {}) => {
  return {
    id: additionalData.id || `${type}_${Date.now()}_${Math.random()}`,
    type,
    description,
    performedBy,
    department,
    timestamp: new Date().toISOString(),
    ...additionalData
  };
};
