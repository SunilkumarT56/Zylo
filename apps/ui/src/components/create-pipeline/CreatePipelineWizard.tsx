import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { usePipelineWizard } from './PipelineWizardContext';
import { Step1Identity } from './steps/Step1Identity';
import { Step2Type } from './steps/Step2Type';
import { Step3Source } from './steps/Step3Source';
import { Step4YouTube } from './steps/Step4YouTube';
import { Step5Metadata } from './steps/Step5Metadata';
import { Step6Scheduling } from './steps/Step6Scheduling';
import { Step7Review } from './steps/Step7Review';

export function CreatePipelineWizard() {
  const { isOpen, setIsOpen, currentStep, goNext, goBack, isStepValid, data, isSubmissionSuccess } =
    usePipelineWizard();

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 'identity':
        return <Step1Identity />;
      case 'type':
        return <Step2Type />;
      case 'source':
        return <Step3Source />;
      case 'youtube':
        return <Step4YouTube />;
      case 'metadata':
        return <Step5Metadata />;
      case 'scheduling':
        return <Step6Scheduling />;
      case 'review':
        return <Step7Review />;
      default:
        return null;
    }
  };

  const stepsList = [
    { id: 'identity', label: 'Identity' },
    { id: 'type', label: 'Type' },
    { id: 'source', label: 'Source' },
    { id: 'youtube', label: 'Channels' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'scheduling', label: 'Schedule' },
    { id: 'review', label: 'Review' },
  ];

  // Filter scheduling optionality for progress bar visibility
  // If manual, we don't strictly show scheduling as active step, but list presence is fine.
  // Actually, UI requires "scheduling" step to be skipped.
  // Should we remove it from the visual stepper if skipped?
  // Yes, for better UX.
  const visualSteps = stepsList.filter((s) => {
    if (s.id === 'scheduling' && data.executionMode !== 'scheduled') return false;
    return true;
  });

  const currentStepIndex = visualSteps.findIndex((s) => s.id === currentStep);

  console.log('DEBUG WIZARD STEPS:', visualSteps);
  console.log('DEBUG WIZARD DATA:', data);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
        onClick={() => setIsOpen(false)}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-[#191919] border border-[#2F2F2F] rounded-2xl shadow-2xl z-[100] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#2F2F2F] flex items-center justify-between bg-[#191919] rounded-t-2xl">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Pipeline</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-zinc-500">
              <span>
                Step {currentStepIndex + 1} of {visualSteps.length}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-300">
                {visualSteps.find((s) => s.id === currentStep)?.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-[#2F2F2F] rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto min-h-[400px]">{renderStep()}</div>

        {/* Footer */}
        {currentStep !== 'review' && (
          <div className="px-8 py-6 border-t border-[#2F2F2F] flex items-center justify-between bg-[#191919] rounded-b-2xl">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={currentStep === 'identity'}
              className={`text-zinc-400 hover:text-white hover:bg-transparent ${
                currentStep === 'identity' ? 'invisible' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={goNext}
              disabled={!isStepValid}
              className="bg-white text-black hover:bg-zinc-200 min-w-[120px]"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Review step has its own footer/button rendered inside the component for direct state control */}
        {currentStep === 'review' && !isSubmissionSuccess && (
          <div className="px-8 py-6 border-t border-[#2F2F2F] flex items-center justify-between bg-[#191919] rounded-b-2xl">
            <Button
              variant="ghost"
              onClick={goBack}
              className="text-zinc-400 hover:text-white hover:bg-transparent"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {/* Note: The 'Create' button is inside Step7Review, so we assume step 7 renders its own interactions or we pass props.
                    The design in Step7Review.tsx includes the button.
                */}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
