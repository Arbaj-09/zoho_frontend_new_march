import { backendApi } from "@/services/api";
import { getAuthUser } from "@/utils/authUser";

// 🎯 Department-aware API service for all entities
export const departmentApiService = {
  // Get current user's department
  getCurrentDepartment: () => {
    const user = getAuthUser();
    return user?.department || null;
  },

  // 🎯 Department-wise tasks API
  getTasks: async (params = {}) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can access all tasks without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - fetching all tasks without department filter');
      const queryParams = { ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await backendApi.get(`/tasks${queryString ? '?' + queryString : ''}`);
      return response || [];
    }
    
    // 🔥 TL users need department filtering
    if (!department) {
      throw new Error('Department information required for tasks access');
    }
    
    const queryParams = {
      department,
      ...params
    };
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await backendApi.get(`/tasks?${queryString}`);
    return response || [];
  },

  // 🎯 Department-wise customers API
  getCustomers: async (params = {}) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can access all customers without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - fetching all customers without department filter');
      const queryParams = { ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await backendApi.get(`/clients${queryString ? '?' + queryString : ''}`);
      return response || [];
    }
    
    // 🔥 TL users need department filtering
    if (!department) {
      throw new Error('Department information required for customers access');
    }
    
    const queryParams = {
      department,
      ...params
    };
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await backendApi.get(`/clients?${queryString}`);
    return response || [];
  },

  // 🎯 Department-wise products API
  getProducts: async (params = {}) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can access all products without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - fetching all products without department filter');
      const queryParams = { ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await backendApi.get(`/products${queryString ? '?' + queryString : ''}`);
      return response || [];
    }
    
    // 🔥 TL users need department filtering
    if (!department) {
      throw new Error('Department information required for products access');
    }
    
    const queryParams = {
      department,
      ...params
    };
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await backendApi.get(`/products?${queryString}`);
    return response || [];
  },

  // 🎯 Department-wise bank API
  getBankRecords: async (params = {}) => {
    try {
      const user = getAuthUser();
      
      // 🔥 TEMPORARY: Backend endpoint not ready yet, return empty array
      console.warn('/api/bank endpoint not implemented yet - returning empty array');
      return [];
      
      // TODO: Uncomment when backend is ready
      // const queryParams = { ...params };
      // delete queryParams.department;
      // const queryString = new URLSearchParams(queryParams).toString();
      // const response = await backendApi.get(`/bank${queryString ? '?' + queryString : ''}`);
      // 
      // if ((user?.role === 'TL' || user?.role === 'EMPLOYEE') && user?.department) {
      //   const allRecords = response || [];
      //   return allRecords.filter(record => record.department === user.department);
      // }
      // 
      // return response || [];
    } catch (error) {
      console.error('Bank API error:', error.message);
      return [];
    }
  },

  // 🎯 Department-wise employees API
  getEmployees: async (params = {}) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin/Manager can access all employees
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      const queryParams = { ...params };
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await backendApi.get(`/employees${queryString ? '?' + queryString : ''}`);
      return response || [];
    }
    
    // 🔥 TL users need department filtering
    if (!department) {
      throw new Error('Department information required for employees access');
    }
    
    const queryParams = {
      department,
      ...params
    };
    
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await backendApi.get(`/employees?${queryString}`);
    return response || [];
  },

  // 🎯 Department-wise activities API
  getActivities: async (params = {}) => {
    try {
      const user = getAuthUser();
      
      // 🔥 TEMPORARY: Backend endpoint not ready yet, return empty array
      console.warn('/api/activities endpoint not implemented yet - returning empty array');
      return [];
      
      // TODO: Uncomment when backend is ready
      // const department = user?.department;
      // 
      // if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      //   console.log('Admin/Manager user - fetching all activities without department filter');
      //   const queryParams = { ...params };
      //   const queryString = new URLSearchParams(queryParams).toString();
      //   const response = await backendApi.get(`/activities${queryString ? '?' + queryString : ''}`);
      //   return response || [];
      // }
      // 
      // if (!department) {
      //   throw new Error('Department information required for activities access');
      // }
      // 
      // const queryParams = {
      //   department,
      //   ...params
      // };
      // 
      // const queryString = new URLSearchParams(queryParams).toString();
      // const response = await backendApi.get(`/activities?${queryString}`);
      // return response || [];
    } catch (error) {
      console.error('Activities API error:', error.message);
      return [];
    }
  },

  // 🎯 Create task with department
  createTask: async (taskData) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can create tasks without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - creating task without department restriction');
      const response = await backendApi.post('/tasks', taskData);
      return response;
    }
    
    // 🔥 TL users need department
    if (!department) {
      throw new Error('Department information required for task creation');
    }
    
    const payload = {
      ...taskData,
      department
    };
    
    const response = await backendApi.post('/tasks', payload);
    return response;
  },

  // 🎯 Update task (ensure department matches)
  updateTask: async (id, taskData) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can update tasks without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - updating task without department restriction');
      const response = await backendApi.put(`/tasks/${id}`, taskData);
      return response;
    }
    
    // 🔥 TL users need department
    if (!department) {
      throw new Error('Department information required for task update');
    }
    
    const payload = {
      ...taskData,
      department
    };
    
    const response = await backendApi.put(`/tasks/${id}`, payload);
    return response;
  },

  // 🎯 Delete task (with department verification)
  deleteTask: async (id) => {
    const user = getAuthUser();
    const department = user?.department;
    
    // 🔥 Admin users can delete tasks without department restriction
    if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
      console.log('Admin/Manager user - deleting task without department restriction');
      const response = await backendApi.delete(`/tasks/${id}`);
      return response;
    }
    
    // 🔥 TL users need department
    if (!department) {
      throw new Error('Department information required for task deletion');
    }
    
    const response = await backendApi.delete(`/tasks/${id}?department=${department}`);
    return response;
  }
};
