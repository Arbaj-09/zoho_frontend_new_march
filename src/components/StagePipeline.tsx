"use client";

import { useStages } from "@/context/StageContext";
import { CheckCircle2, PauseCircle } from "lucide-react";

interface StagePipelineProps {
  currentStage: string;
  department: string;
  onStageChange: (newStage: string) => void;
  disabled?: boolean;
}

export default function StagePipeline({ 
  currentStage, 
  department, 
  onStageChange, 
  disabled = false 
}: StagePipelineProps) {
  const { getStagesForDepartment, getStageName, isTerminalStage, getStageOrder } = useStages();
  
  const stages = getStagesForDepartment(department);
  
  if (stages.length === 0) {
    return (
      <div className="text-center text-slate-500 py-4">
        No stages configured for {department}
      </div>
    );
  }

  const currentStageData = stages.find(s => s.stageCode === currentStage);
  const currentIndex = currentStageData ? stages.findIndex(s => s.stageCode === currentStage) : -1;
  const currentOrder = currentStageData?.stageOrder || 0;

  return (
    <div className="relative flex items-center gap-4 overflow-x-auto pb-2">
      <div className="absolute inset-x-10 top-1/2 -z-10 h-[2px] translate-y-[-50%] rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200" />
      
      {stages.map((stage, index) => {
        const stageOrder = stage.stageOrder || 0;
        const completed = currentIndex > -1 && stageOrder < currentOrder;
        const isCurrent = stage.stageCode === currentStage;
        const isTerminal = stage.isTerminal || false;

        return (
          <div key={stage.stageCode} className="relative flex items-center gap-3 pr-4">
            <div
              onClick={() => !disabled && !isTerminal && onStageChange(stage.stageCode)}
              title={stage.stageName}
              className={`flex h-9 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium shadow-sm transition-all duration-200 ${
                disabled || isTerminal ? "cursor-not-allowed" : "cursor-pointer"
              } ${
                completed
                  ? "border-emerald-400 bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-emerald-50 shadow-emerald-500/30"
                  : isCurrent
                  ? "border-indigo-400 bg-gradient-to-r from-indigo-600 to-sky-600 text-slate-50 shadow-indigo-500/40 ring-2 ring-indigo-400/40"
                  : isTerminal
                  ? "border-slate-300 bg-slate-100 text-slate-600"
                  : "border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  completed
                    ? "bg-emerald-50 text-emerald-700"
                    : isCurrent
                    ? "bg-white/20 text-slate-50 ring-1 ring-white/40"
                    : isTerminal
                    ? "bg-slate-200 text-slate-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {completed ? <CheckCircle2 className="h-3.5 w-3.5" : index + 1}
              </div>
              <span className="whitespace-nowrap">{stage.stageName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
