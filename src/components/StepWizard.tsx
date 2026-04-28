import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  description?: string;
  content: React.ReactNode;
  validate?: () => boolean;
}

interface StepWizardProps {
  steps: Step[];
  onFinish: (data: Record<string, any>) => void;
  onSave?: (step: number, data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export function StepWizard({ steps, onFinish, onSave, initialData = {} }: StepWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = () => {
    const step = steps[currentStep];
    if (step.validate && !step.validate()) {
      return;
    }
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = () => {
    onSave?.(currentStep, formData);
  };

  const handleFinish = () => {
    const step = steps[currentStep];
    if (step.validate && !step.validate()) {
      return;
    }
    onFinish(formData);
  };

  const updateData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                    index < currentStep
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : index === currentStep
                      ? "bg-white border-indigo-600 text-indigo-600"
                      : "bg-white border-gray-300 text-gray-400"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="mt-2 text-xs text-center w-24">
                  <div
                    className={cn(
                      "font-medium",
                      index <= currentStep ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-gray-400 mt-0.5">{step.description}</div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 mb-6",
                    index < currentStep ? "bg-indigo-600" : "bg-gray-200"
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border p-6 min-h-[400px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(index === currentStep ? "block" : "hidden")}
          >
            <h3 className="text-lg font-semibold mb-4">{step.title}</h3>
            <StepWizardContext.Provider value={{ data: formData, updateData }}>
              {step.content}
            </StepWizardContext.Provider>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentStep === 0}
        >
          上一步
        </Button>
        <div className="flex gap-2">
          {onSave && (
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              保存
            </Button>
          )}
          {isLastStep ? (
            <Button onClick={handleFinish}>
              完成
            </Button>
          ) : (
            <Button onClick={handleNext}>
              保存并下一步
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Context for child components to access/update wizard data
import { createContext, useContext } from "react";

interface WizardContextType {
  data: Record<string, any>;
  updateData: (key: string, value: any) => void;
}

const StepWizardContext = createContext<WizardContextType | null>(null);

export function useWizardData() {
  const context = useContext(StepWizardContext);
  if (!context) {
    throw new Error("useWizardData must be used within StepWizard");
  }
  return context;
}
