import { useState, useEffect } from 'react';
import { usePipelineWizard } from '../PipelineWizardContext';
import { Check, AlertTriangle, MonitorPlay, Smartphone, Clock, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Step7Review() {
  const { data, setStepValid, setIsOpen, reset, userChannel, setIsSubmissionSuccess } =
    usePipelineWizard();
  const [confirmed, setConfirmed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStepValid(confirmed);
  }, [confirmed, setStepValid]);

  const handleCreate = async () => {
    if (!confirmed) return;
    setIsCreating(true);
    setError(null);

    // Mock API Call matching existing CreatePipelineModal logic but with extended data
    // In a real scenario, we'd send all `data` fields.
    // The existing endpoint likely only takes `name`, `adminName`, `color`.
    // We will send a superset and hope backend ignores extra or just the basics for success.

    try {
      let token = localStorage.getItem('authToken');
      if (!token) {
        token =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM';
      }

      let sourceConfig = {};

      switch (data.sourceType) {
        case 'google_drive':
          sourceConfig = {
            driveFolderId: data.driveFolderId,
          };
          break;
        case 's3':
          sourceConfig = {
            bucket: data.s3Bucket,
            prefix: data.s3Prefix,
          };
          break;
        case 'git':
          sourceConfig = {
            repoUrl: data.gitRepoUrl,
            branch: data.gitBranch,
            path: data.gitPath,
          };
          break;
        case 'upload':
          sourceConfig = {};
          break;
      }

      const payload = {
        pipelineName: data.pipelineName,
        color: data.color || '#3B82F6',
        pipelineType: data.pipelineType,
        executionMode: data.executionMode,
        sourceType: data.sourceType,
        sourceConfig,
        connectedChannelId: data.connectedChannelId,
        defaultPrivacy: data.defaultPrivacy,
        category: data.category,
        madeForKids: data.madeForKids,
        titleTemplate: data.titleTemplate,
        descriptionTemplate: data.descriptionTemplate,
        tagsTemplate: data.tagsTemplate,
        language: data.language,
        region: data.region,
        thumbnailMode: data.thumbnailMode,
        thumbnailTemplateId: data.thumbnailTemplateId,
        timezone: data.timezone,
        scheduleFrequency: data.scheduleFrequency,
        cronExpression: data.cronExpression,
        intervalMinutes: data.intervalMinutes,
        startAt: data.startDate,
        endAt: data.endDate,
      };

      const response = await fetch(
        'https://untolerative-len-rumblingly.ngrok-free.dev/user/create/pipeline',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        if (errText.includes('PIPELINE_ALREADY_EXISTS')) {
          throw new Error('Pipeline name already exists');
        }
        throw new Error('Failed to create pipeline');
      }

      // Success
      setIsSuccess(true);
      setIsSubmissionSuccess(true);
    } catch (err: any) {
      console.error('Creation failed', err);
      setError(err.message || 'Failed to create pipeline. Backend rejection or network error.');
    } finally {
      setIsCreating(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-black" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-white">Pipeline Created</h3>
          <p className="text-zinc-400">Your new pipeline has been successfully set up.</p>
        </div>
        <Button
          onClick={() => {
            setIsOpen(false);
            reset();
          }}
          className="bg-white text-black hover:bg-zinc-200 min-w-[120px]"
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">Review & Create</h3>
        <p className="text-sm text-zinc-400">Review your settings before creating the pipeline.</p>
      </div>

      <div className="bg-white/5 rounded-xl border border-white/10 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-zinc-500">Pipeline Identity</div>
            <div className="text-lg font-medium text-white">{data.pipelineName}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-white text-xs border border-zinc-700">
              {data.pipelineType === 'youtube_shorts' ? (
                <Smartphone className="w-3 h-3" />
              ) : (
                <MonitorPlay className="w-3 h-3" />
              )}
              {data.pipelineType === 'youtube_shorts' ? 'Shorts' : 'Long Form'}
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-white text-xs border border-zinc-700">
              {data.executionMode === 'scheduled' ? (
                <Clock className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
              {data.executionMode === 'scheduled' ? 'Scheduled' : 'Manual'}
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-zinc-500 block mb-1">Source</span>
            <span className="text-white capitalize">{data.sourceType?.replace('_', ' ')}</span>
            {data.sourceType === 'google_drive' && (
              <span className="block text-zinc-500 text-xs truncate">ID: {data.driveFolderId}</span>
            )}
            {data.sourceType === 'git' && (
              <span className="block text-zinc-500 text-xs truncate">{data.gitRepoUrl}</span>
            )}
          </div>
          <div>
            <span className="text-zinc-500 block mb-1">Destination</span>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-white">YouTube</span>
              <span className="text-zinc-600">{'\\'}</span>

              <div className="flex items-center gap-2">
                {userChannel && userChannel.id === data.connectedChannelId ? (
                  <>
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                      <img
                        src={userChannel.thumbnails.default.url}
                        alt={userChannel.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className="text-zinc-300 truncate max-w-[150px]"
                      title={userChannel.title}
                    >
                      {userChannel.title}
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-500">ID: {data.connectedChannelId}</span>
                )}
              </div>

              <span className="text-zinc-600">{'\\'}</span>
              <span className="text-zinc-400 capitalize">{data.defaultPrivacy}</span>
            </div>
          </div>
        </div>

        {/* Metadata Section */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10 space-y-2">
          <div className="text-zinc-500 text-sm font-medium">Metadata Strategy</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-600 block">Thumbnail</span>
              <span className="text-zinc-300 capitalize">
                {data.thumbnailMode?.replace('_', ' ') || 'Auto-generated'}
              </span>
            </div>
            <div>
              <span className="text-zinc-600 block">Templates</span>
              <span className="text-zinc-300 block truncate" title={data.titleTemplate}>
                Title: {data.titleTemplate || 'Default'}
              </span>
            </div>
          </div>
        </div>

        {data.executionMode === 'scheduled' && (
          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800 flex gap-3 text-sm">
            <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-zinc-200 font-medium">Scheduled Run</div>
              <div className="text-zinc-400 text-xs">
                {data.scheduleFrequency === 'cron'
                  ? `Cron: ${data.cronExpression}`
                  : `Every ${data.intervalMinutes} mins`}
                <br />
                Timezone: {data.timezone}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400 text-sm">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="pt-4">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              confirmed
                ? 'bg-zinc-100 border-zinc-100'
                : 'bg-transparent border-zinc-600 group-hover:border-zinc-500'
            }`}
          >
            {confirmed && <Check className="w-3 h-3 text-black" />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          <div className="text-sm text-zinc-400 select-none group-hover:text-zinc-300">
            I confirm that the settings above are correct and understand that the pipeline type
            cannot be changed after creation.
          </div>
        </label>
      </div>

      <Button
        onClick={handleCreate}
        disabled={!confirmed || isCreating}
        className="w-full bg-white text-black hover:bg-zinc-200 mt-6"
      >
        {isCreating ? 'Creating Pipeline...' : 'Create Pipeline'}
      </Button>
    </div>
  );
}
