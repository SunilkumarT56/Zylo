import React, { createContext, useContext, useState, useCallback } from 'react';
import { type PipelineData, INITIAL_DATA, type WizardStep, type ChannelData } from './types';

interface PipelineWizardContextType {
  data: PipelineData;
  currentStep: WizardStep;
  setData: (data: Partial<PipelineData>) => void;
  goToStep: (step: WizardStep) => void;
  goNext: () => void;
  goBack: () => void;
  reset: () => void;
  validationErrors: Record<string, string>;
  setValidationErrors: (errors: Record<string, string>) => void;
  isStepValid: boolean;
  setStepValid: (valid: boolean) => void;

  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userChannel: ChannelData | null;
  setUserChannel: (channel: ChannelData | null) => void;
  isSubmissionSuccess: boolean;
  setIsSubmissionSuccess: (success: boolean) => void;
}

const PipelineWizardContext = createContext<PipelineWizardContextType | undefined>(undefined);

const STEPS: WizardStep[] = [
  'identity',
  'type',
  'source',
  'youtube',
  'metadata',
  'scheduling',
  'review',
];

export function PipelineWizardProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setPipelineData] = useState<PipelineData>(INITIAL_DATA);
  const [currentStep, setCurrentStep] = useState<WizardStep>('identity');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [isStepValid, setStepValid] = useState(false);
  const [userChannel, setUserChannel] = useState<ChannelData | null>(null);
  const [isSubmissionSuccess, setIsSubmissionSuccess] = useState(false);

  const setData = useCallback((updates: Partial<PipelineData>) => {
    setPipelineData((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setPipelineData({
      ...INITIAL_DATA,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setCurrentStep('identity');
    setValidationErrors({});
    setStepValid(false);
    setIsSubmissionSuccess(false);
  }, []);

  // Listen for global open event
  React.useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      reset(); // Option: reset on new open? Or keep state? Let's reset for fresh start if requested.
      // Actually usually "Create Pipeline" implies a new one.
    };
    window.addEventListener('open-pipeline-wizard', handleOpen);
    return () => window.removeEventListener('open-pipeline-wizard', handleOpen);
  }, [reset]);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    setValidationErrors({});
    // We assume entering a step, valid is false until effects run
    setStepValid(false);
  }, []);

  const goNext = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);

    // Logic to skip Scheduling if not scheduled
    let nextIndex = currentIndex + 1;
    if (STEPS[nextIndex] === 'scheduling' && data.executionMode !== 'scheduled') {
      nextIndex++;
    }

    if (nextIndex < STEPS.length) {
      goToStep(STEPS[nextIndex]);
    }
  }, [currentStep, data.executionMode, goToStep]);

  const goBack = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);

    // Logic to skip Scheduling if not scheduled
    let prevIndex = currentIndex - 1;
    if (STEPS[prevIndex] === 'scheduling' && data.executionMode !== 'scheduled') {
      prevIndex--;
    }

    if (prevIndex >= 0) {
      goToStep(STEPS[prevIndex]);
    }
  }, [currentStep, data.executionMode, goToStep]);

  return (
    <PipelineWizardContext.Provider
      value={{
        data,
        currentStep,
        setData,
        goToStep,
        goNext,
        goBack,
        reset,
        validationErrors,
        setValidationErrors,
        isStepValid,
        setStepValid,
        isOpen,

        setIsOpen,
        userChannel,
        setUserChannel,
        isSubmissionSuccess,
        setIsSubmissionSuccess,
      }}
    >
      {children}
    </PipelineWizardContext.Provider>
  );
}

export function usePipelineWizard() {
  const context = useContext(PipelineWizardContext);
  if (context === undefined) {
    throw new Error('usePipelineWizard must be used within a PipelineWizardProvider');
  }
  return context;
}
