"use client";

import { WizardProvider, useWizard } from "@/features/wizard/WizardContext";
import { WizardStep0 } from "@/features/wizard/steps/W0";
import { WizardStep1 } from "@/features/wizard/steps/W1";
import { WizardStep2 } from "@/features/wizard/steps/W2";
import { WizardStep3 } from "@/features/wizard/steps/W3";
import { WizardStep4 } from "@/features/wizard/steps/W4";

function WizardContent() {
  const { state } = useWizard();

  const steps = [
    { id: 0, title: "SKU/Profile", component: <WizardStep0 /> },
    { id: 1, title: "Context", component: <WizardStep1 /> },
    { id: 2, title: "Sources", component: <WizardStep2 /> },
    { id: 3, title: "Output", component: <WizardStep3 /> },
    { id: 4, title: "Review", component: <WizardStep4 /> },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                state.currentStep === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : state.currentStep > index
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-300 bg-white text-gray-400"
              }`}
            >
              {state.currentStep > index ? "✓" : index}
            </div>
            <span
              className={`ml-2 text-sm ${
                state.currentStep === index
                  ? "font-semibold text-blue-600"
                  : state.currentStep > index
                    ? "text-green-600"
                    : "text-gray-400"
              }`}
            >
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 h-0.5 w-8 ${
                  state.currentStep > index ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        {steps[state.currentStep].component}
      </div>
    </div>
  );
}

export default function WizardPage() {
  return (
    <WizardProvider>
      <WizardContent />
    </WizardProvider>
  );
}
