"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { backendApi } from "@/services/api";

const StageContext = createContext();

export function StageProvider({ children }) {
  const [departments, setDepartments] = useState([]);
  const [stagesByDepartment, setStagesByDepartment] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await backendApi.get("/stages/departments");
      
      // backendApi returns parsed JSON directly, not Axios response
      const departmentsList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];
      
      setDepartments(departmentsList);
      
      if (!departmentsList || departmentsList.length === 0) {
        console.warn("WARNING: No departments returned from API");
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      setError(err?.message || "Failed to load departments");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stages for a specific department
  const fetchStagesForDepartment = async (department) => {
    if (!department) {
      return [];
    }
    
    // Return cached data if available
    if (stagesByDepartment[department]) {
      return stagesByDepartment[department];
    }

    try {
      setLoading(true);
      
      const data = await backendApi.get(`/stages?department=${department}`);
      
      // backendApi returns parsed JSON directly, not Axios response
      const stagesList = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
        ? data.data
        : [];
      
      // Sort by stageOrder
      const sortedStages = stagesList.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0));
      
      // Cache the stages
      setStagesByDepartment(prev => ({
        ...prev,
        [department]: sortedStages
      }));
      
      return sortedStages;
    } catch (err) {
      console.error(`Failed to fetch stages for department ${department}:`, err);
      setError(err?.message || `Failed to load stages for ${department}`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get stages for a department (from cache or fetch)
  const getStagesForDepartment = (department) => {
    return stagesByDepartment[department] || [];
  };

  // Get stage name by code and department
  const getStageName = (department, stageCode) => {
    const stages = getStagesForDepartment(department);
    const stage = stages.find(s => s.stageCode === stageCode);
    return stage?.stageName || stageCode;
  };

  // Check if stage is terminal
  const isTerminalStage = (department, stageCode) => {
    const stages = getStagesForDepartment(department);
    const stage = stages.find(s => s.stageCode === stageCode);
    return stage?.isTerminal || false;
  };

  // Get stage order
  const getStageOrder = (department, stageCode) => {
    const stages = getStagesForDepartment(department);
    const stage = stages.find(s => s.stageCode === stageCode);
    return stage?.stageOrder || 0;
  };

  // Initialize departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const value = {
    departments,
    stagesByDepartment,
    loading,
    error,
    fetchDepartments,
    fetchStagesForDepartment,
    getStagesForDepartment,
    getStageName,
    isTerminalStage,
    getStageOrder,
  };

  return (
    <StageContext.Provider value={value}>
      {children}
    </StageContext.Provider>
  );
}

export function useStages() {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error("useStages must be used within a StageProvider");
  }
  return context;
}
