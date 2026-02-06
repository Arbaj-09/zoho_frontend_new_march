import { backendApi } from "@/services/api";

export const clientApi = {
  list: async () => {
    const res = await backendApi.get("/clients");
    return res ?? [];
  },

  getById: async (id) => {
    const res = await backendApi.get(`/clients/${id}`);
    return res;
  },

  create: async (payload) => {
    const res = await backendApi.post("/clients", payload);
    return res;
  },

  update: async (id, payload) => {
    const res = await backendApi.put(`/clients/${id}`, payload);
    return res;
  },

  delete: async (id) => {
    const res = await backendApi.delete(`/clients/${id}`);
    return res;
  },

  // ✅ NEW: Client custom fields
  getFieldValues: async (clientId) => {
    const res = await backendApi.get(`/clients/${clientId}/fields`);
    return res ?? [];
  },

  getFieldValuesAsMap: async (clientId) => {
    const res = await backendApi.get(`/clients/${clientId}/fields/map`);
    return res ?? {};
  },

  upsertFieldValue: async (clientId, fieldKey, value) => {
    const res = await backendApi.post(`/clients/${clientId}/fields`, { fieldKey, value });
    return res;
  },

  bulkUpdateFieldValues: async (clientId, fieldValues) => {
    const res = await backendApi.post(`/clients/${clientId}/fields/bulk`, fieldValues);
    return res ?? {};
  },

  deleteFieldValue: async (clientId, fieldKey) => {
    const res = await backendApi.delete(`/clients/${clientId}/fields/${fieldKey}`);
    return res;
  },

  // ✅ NEW: Client sites
  getSites: async (clientId) => {
    const res = await backendApi.get(`/clients/${clientId}/sites`);
    return res ?? [];
  },

  createSite: async (clientId, siteData) => {
    const res = await backendApi.post(`/clients/${clientId}/sites`, siteData);
    return res;
  },

  updateSite: async (clientId, siteId, siteData) => {
    const res = await backendApi.put(`/clients/${clientId}/sites/${siteId}`, siteData);
    return res;
  },

  deleteSite: async (clientId, siteId) => {
    const res = await backendApi.delete(`/clients/${clientId}/sites/${siteId}`);
    return res;
  },

  // ✅ NEW: Client deals (existing)
  getDeal: async (clientId) => {
    const res = await backendApi.get(`/clients/${clientId}/deal`);
    return res;
  },

  createDeal: async (clientId, dealData) => {
    const res = await backendApi.post(`/clients/${clientId}/deal`, dealData);
    return res;
  },
};
