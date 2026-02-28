import { backendApi } from "@/services/api";

// Stage-related API calls
export const stageApi = {
  // Get all departments
  getDepartments: async () => {
    const data = await backendApi.get("/stages/departments");
    // backendApi returns parsed JSON directly, not Axios response
    const departments = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return departments;
  },

  // Get stages for a specific department
  getStagesByDepartment: async (department) => {
    const data = await backendApi.get(`/stages?department=${department}`);
    // backendApi returns parsed JSON directly, not Axios response
    const stages = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : [];
    // Sort by stageOrder
    return stages.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
  },

  // Update deal stage
  updateDealStage: async (dealId, newStage, department) => {
    return await backendApi.post(`/deals/${dealId}/stages`, {
      newStage,
      department
    });
  },

  // Get deal timeline
  getDealTimeline: async (dealId) => {
    const data = await backendApi.get(`/deals/${dealId}/timeline`);
    // backendApi returns parsed JSON directly, not Axios response
    const timeline = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return timeline;
  },

  // Get clients filtered by department and stage
  getClientsByFilters: async (department, stage) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    if (stage) params.append("stage", stage);
    
    const data = await backendApi.get(`/clients?${params.toString()}`);
    // backendApi returns parsed JSON directly, not Axios response
    const clients = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data?.data)
      ? data.data
      : [];
    return clients;
  }
};
