import { backendApi } from "@/services/api";

export const formApi = {
  list: async () => {
    const res = await backendApi.get("/forms");
    return res?.data ?? res ?? [];
  },

  getById: async (id) => {
    const res = await backendApi.get(`/forms/${id}`);
    return res?.data ?? res;
  },

  create: async (payload) => {
    const res = await backendApi.post("/forms", payload);
    return res?.data ?? res;
  },

  update: async (id, payload) => {
    const res = await backendApi.put(`/forms/${id}`, payload);
    return res?.data ?? res;
  },

  delete: async (id) => {
    const res = await backendApi.delete(`/forms/${id}`);
    return res?.data ?? res;
  },
};
