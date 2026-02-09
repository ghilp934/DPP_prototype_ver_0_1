"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import { SKU, ProfileId } from "@/contracts/constants";
import { logEvent } from "@/lib/telemetry";

export interface WizardState {
  currentStep: number; // 0~4
  sku: SKU | null;
  profileId: ProfileId | null;
  secureMode: boolean;
  runName: string;
  // W1 필드
  context: {
    grant?: {
      projectName: string;
      announcementUrl?: string;
    };
    rfp?: {
      agency: string;
      scope: string;
    };
  };
  // W2 필드
  sources: {
    files: File[];
    urls: string[];
  };
  // W3 필드
  output: {
    formats: string[]; // ["PDF", "DOCX"]
    evidenceLevel: "minimal" | "standard";
  };
}

export type WizardAction =
  | { type: "SET_SKU"; payload: SKU }
  | { type: "SET_PROFILE"; payload: ProfileId }
  | { type: "SET_SECURE_MODE"; payload: boolean }
  | { type: "SET_RUN_NAME"; payload: string }
  | { type: "SET_GRANT_CONTEXT"; payload: { projectName: string; announcementUrl?: string } }
  | { type: "SET_RFP_CONTEXT"; payload: { agency: string; scope: string } }
  | { type: "ADD_FILE"; payload: File }
  | { type: "REMOVE_FILE"; payload: number }
  | { type: "ADD_URL"; payload: string }
  | { type: "REMOVE_URL"; payload: number }
  | { type: "SET_OUTPUT_FORMATS"; payload: string[] }
  | { type: "SET_EVIDENCE_LEVEL"; payload: "minimal" | "standard" }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "RESET" };

const initialState: WizardState = {
  currentStep: 0,
  sku: null,
  profileId: null,
  secureMode: false,
  runName: "",
  context: {},
  sources: { files: [], urls: [] },
  output: { formats: ["PDF"], evidenceLevel: "standard" },
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_SKU":
      return { ...state, sku: action.payload };
    case "SET_PROFILE":
      return { ...state, profileId: action.payload };
    case "SET_SECURE_MODE":
      // Secure Mode ON 시 기존 URL 데이터 강제 초기화 (LOCK-RFP-SEC-01)
      return {
        ...state,
        secureMode: action.payload,
        sources: {
          ...state.sources,
          urls: action.payload ? [] : state.sources.urls,
        },
      };
    case "SET_RUN_NAME":
      return { ...state, runName: action.payload };
    case "SET_GRANT_CONTEXT":
      return {
        ...state,
        context: { ...state.context, grant: action.payload },
      };
    case "SET_RFP_CONTEXT":
      return {
        ...state,
        context: { ...state.context, rfp: action.payload },
      };
    case "ADD_FILE":
      return {
        ...state,
        sources: { ...state.sources, files: [...state.sources.files, action.payload] },
      };
    case "REMOVE_FILE":
      return {
        ...state,
        sources: {
          ...state.sources,
          files: state.sources.files.filter((_, i) => i !== action.payload),
        },
      };
    case "ADD_URL":
      return {
        ...state,
        sources: { ...state.sources, urls: [...state.sources.urls, action.payload] },
      };
    case "REMOVE_URL":
      return {
        ...state,
        sources: {
          ...state.sources,
          urls: state.sources.urls.filter((_, i) => i !== action.payload),
        },
      };
    case "SET_OUTPUT_FORMATS":
      return {
        ...state,
        output: { ...state.output, formats: action.payload },
      };
    case "SET_EVIDENCE_LEVEL":
      return {
        ...state,
        output: { ...state.output, evidenceLevel: action.payload },
      };
    case "NEXT_STEP":
      return { ...state, currentStep: Math.min(state.currentStep + 1, 4) };
    case "PREV_STEP":
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

const WizardContext = createContext<{
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  // Telemetry: Wizard step 변경 추적
  useEffect(() => {
    // step 변경 시 telemetry 이벤트 로깅
    const stepIds = ["step-sku", "step-context", "step-sources", "step-output", "step-review"];
    logEvent({
      type: "ui.wizard.step_viewed",
      step_id: stepIds[state.currentStep] || `step-${state.currentStep}`,
      profile_id: state.profileId || "unknown",
    });
  }, [state.currentStep, state.profileId]);

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard must be used within WizardProvider");
  return context;
}
