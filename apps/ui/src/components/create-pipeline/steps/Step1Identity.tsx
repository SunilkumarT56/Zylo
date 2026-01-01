import { useEffect, useState, useCallback } from 'react';
import { usePipelineWizard } from '../PipelineWizardContext';
import { Check, X, Loader2 } from 'lucide-react';

export function Step1Identity() {
  const { data, setData, setValidationErrors, setStepValid } = usePipelineWizard();
  const [localName, setLocalName] = useState(data.pipelineName);
  const [checkingName, setCheckingName] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Constants
  const MIN_LENGTH = 3;
  const MAX_LENGTH = 60;

  const validateName = useCallback(
    async (name: string) => {
      setCheckingName(true);
      setLocalError(null);
      let isValid = true;
      let errorMsg = '';

      const trimmed = name.trim();

      if (!trimmed) {
        isValid = false;
        if (name.length > 0) errorMsg = 'Name is required';
        else isValid = false;
      } else if (trimmed.length < MIN_LENGTH) {
        isValid = false;
        errorMsg = `Name must be at least ${MIN_LENGTH} characters`;
      } else if (trimmed.length > MAX_LENGTH) {
        isValid = false;
        errorMsg = `Name must be less than ${MAX_LENGTH} characters`;
      } else if (/^[^a-zA-Z0-9]+$/.test(trimmed)) {
        isValid = false;
        errorMsg = 'Name cannot contain only symbols';
      } else {
        // Mocked server check
        if (trimmed.toLowerCase() === 'existingpipeline') {
          isValid = false;
          errorMsg = 'Pipeline name already exists';
        }
      }

      if (!isValid && errorMsg) {
        setLocalError(errorMsg);
        setValidationErrors({ pipelineName: errorMsg });
      } else if (isValid) {
        setData({ pipelineName: trimmed });
        setValidationErrors({});
      }

      setStepValid(isValid && trimmed.length > 0);
      setCheckingName(false);
    },
    [setData, setValidationErrors, setStepValid],
  );

  useEffect(() => {
    const timer = setTimeout(async () => {
      validateName(localName);
    }, 500);

    return () => clearTimeout(timer);
  }, [localName, validateName]);

  const traverseChange = (val: string) => {
    setLocalName(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">Name your pipeline</h3>
        <p className="text-sm text-zinc-400">
          Give your pipeline a unique identifier. This will be used in your dashboard and reports.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">
          Pipeline Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={localName}
            onChange={(e) => traverseChange(e.target.value)}
            onBlur={() => setLocalName((prev) => prev.trim())}
            className={`w-full bg-white/5 border rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
              localError
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-white/10 focus:border-white/20 focus:ring-white/20'
            }`}
            placeholder="e.g. Daily Tech News Shorts"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {checkingName ? (
              <Loader2 className="w-4 h-4 text-zinc-500 animate-spin" />
            ) : localName && !localError ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : localName && localError ? (
              <X className="w-4 h-4 text-red-500" />
            ) : null}
          </div>
        </div>
        {localError && <p className="text-xs text-red-400 flex items-center gap-1">{localError}</p>}
        <p className="text-xs text-zinc-500 text-right">
          {localName.length}/{MAX_LENGTH}
        </p>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-300">Pipeline Color</label>
        <div className="grid grid-cols-6 gap-2">
          {[
            'linear-gradient(to right, #4f46e5, #9333ea)', // Indigo to Purple
            'linear-gradient(to right, #ec4899, #8b5cf6)', // Pink to Violet
            'linear-gradient(to right, #3b82f6, #06b6d4)', // Blue to Cyan
            'linear-gradient(to right, #10b981, #3b82f6)', // Emerald to Blue
            'linear-gradient(to right, #f59e0b, #ef4444)', // Amber to Red
            'linear-gradient(to right, #84cc16, #10b981)', // Lime to Emerald
          ].map((color, idx) => (
            <button
              key={idx}
              onClick={() => setData({ ...data, color })}
              className={`w-full h-10 rounded-md transition-all ${
                data.color === color
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105'
                  : 'hover:opacity-80'
              }`}
              style={{ background: color }}
              aria-label={`Select pipeline color ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
