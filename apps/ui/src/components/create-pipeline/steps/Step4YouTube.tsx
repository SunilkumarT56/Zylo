import { useEffect } from 'react';
import { usePipelineWizard } from '../PipelineWizardContext';
import { type PrivacyStatus } from '../types';
import { Youtube, Shield, Globe, Lock } from 'lucide-react';

// Mock Connected Channels
const MOCK_CHANNELS = [
  { id: 'ch_1', name: 'My Tech Channel', thumbnail: '' },
  { id: 'ch_2', name: 'Daily Vlogs', thumbnail: '' },
];

const CATEGORIES = [
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
];

const PrivacyOption = ({
  value,
  icon: Icon,
  label,
  currentValue,
  onSelect,
}: {
  value: PrivacyStatus;
  icon: React.ElementType;
  label: string;
  currentValue: PrivacyStatus;
  onSelect: (val: PrivacyStatus) => void;
}) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all flex-1 ${
      currentValue === value
        ? 'bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500 text-white'
        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-zinc-400'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export function Step4YouTube() {
  const { data, setData, setStepValid, userChannel } = usePipelineWizard();

  useEffect(() => {
    // Validation
    let isValid = true;
    if (!data.connectedChannelId) isValid = false;
    // Category, Privacy, Kids have defaults, so technically always valid if channel selected
    setStepValid(isValid);
  }, [data, setStepValid]);

  const handleChannelSelect = (id: string) => {
    setData({ connectedChannelId: id });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-2">
        <h3 className="text-xl font-medium text-white">YouTube Configuration</h3>
        <p className="text-sm text-zinc-400">
          Connect your channel and set default upload settings.
        </p>
      </div>

      {/* Channel Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-300">
          Connected Channel <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userChannel ? (
            <button
              onClick={() => handleChannelSelect(userChannel.id)}
              className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                data.connectedChannelId === userChannel.id
                  ? 'bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 overflow-hidden">
                {userChannel.thumbnails?.default?.url ? (
                  <img
                    src={userChannel.thumbnails.default.url}
                    alt={userChannel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Youtube className="w-5 h-5" />
                )}
              </div>
              <div>
                <div
                  className="text-white font-medium text-sm truncate max-w-[120px]"
                  title={userChannel.title}
                >
                  {userChannel.title}
                </div>
                <div className="text-xs text-zinc-500">Connected</div>
              </div>
              {data.connectedChannelId === userChannel.id && (
                <div className="absolute top-3 right-3 text-white text-xs font-medium px-2 py-0.5 bg-zinc-800 rounded">
                  Selected
                </div>
              )}
            </button>
          ) : (
            MOCK_CHANNELS.map((channel) => (
              <button
                key={channel.id}
                onClick={() => handleChannelSelect(channel.id)}
                className={`relative flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                  data.connectedChannelId === channel.id
                    ? 'bg-zinc-900 border-zinc-500 ring-1 ring-zinc-500'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{channel.name}</div>
                  <div className="text-xs text-zinc-500">Connected</div>
                </div>
                {data.connectedChannelId === channel.id && (
                  <div className="absolute top-3 right-3 text-white text-xs font-medium px-2 py-0.5 bg-zinc-800 rounded">
                    Selected
                  </div>
                )}
              </button>
            ))
          )}

          <button
            onClick={async () => {
              try {
                const token =
                  localStorage.getItem('authToken') ||
                  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3Njc2NDAzODYsImV4cCI6MTc3NjE5Mzk4Nn0.8aandcUrp7hKDP8Ryw5xlP51Z0EZYKZyec8xM43lZUU';
                const response = await fetch(
                  `https://untolerative-len-rumblingly.ngrok-free.dev/auth/google/url`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      'ngrok-skip-browser-warning': 'true',
                    },
                  },
                );
                if (response.ok) {
                  const data = await response.json();
                  if (data.url) {
                    window.location.href = data.url;
                  }
                }
              } catch (e) {
                console.error('Failed to start OAuth', e);
              }
            }}
            className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-zinc-700 hover:border-zinc-500 hover:bg-white/5 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300 transition-colors">
              <span className="text-lg">+</span>
            </div>
            <div className="text-zinc-500 group-hover:text-zinc-300 transition-colors font-medium text-sm">
              Connect New Channel
            </div>
          </button>
        </div>
      </div>

      <div className="h-px bg-white/10" />

      {/* Default Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Privacy */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Default Privacy</label>
          <div className="flex gap-3">
            <PrivacyOption
              value="private"
              icon={Lock}
              label="Private"
              currentValue={data.defaultPrivacy}
              onSelect={(val) => setData({ defaultPrivacy: val })}
            />
            <PrivacyOption
              value="unlisted"
              icon={Shield}
              label="Unlisted"
              currentValue={data.defaultPrivacy}
              onSelect={(val) => setData({ defaultPrivacy: val })}
            />
            <PrivacyOption
              value="public"
              icon={Globe}
              label="Public"
              currentValue={data.defaultPrivacy}
              onSelect={(val) => setData({ defaultPrivacy: val })}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-300">Category</label>
          <select
            value={data.category}
            onChange={(e) => setData({ category: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-white/20 appearance-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-[#191919]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Made For Kids */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={data.madeForKids}
            onChange={(e) => setData({ madeForKids: e.target.checked })}
            className="w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-white focus:ring-zinc-500 focus:ring-offset-0"
          />
          <div className="flex-1">
            <div className="text-white font-medium text-sm">Made for Kids</div>
            <div className="text-xs text-zinc-500">
              Content is specifically created for children
            </div>
          </div>
        </label>
      </div>
    </div>
  );
}
