import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreHorizontal,
  ChevronRight,
  Play,
  Pause,
  Settings,
  Users,
  FileText,
  BarChart2,
  History,
  Copy,
  Link,
  CreditCard,
  Archive,
  Shield,
  Trash2,
  Activity,
  Layers,
  Zap,
  Clock,
  AlertTriangle,
  Edit3,
  Database,
  Tv,
  UploadCloud,
  Image,
  User,
  UserPlus,
  UserCog,
  UserMinus,
  CheckCircle,
  GitMerge,
  List,
  CheckSquare,
  RefreshCw,
  SkipForward,
  XCircle,
  Sliders,
  LayoutDashboard,
  TrendingUp,
  MousePointerClick,
  UserCheck,
  Bell,
  GitCompare,
  RotateCcw,
  Download,
  ClipboardList,
  LayoutTemplate,
  ArrowRightLeft,
  Split,
  Webhook,
  BellRing,
  Key,
  PieChart,
  HardDrive,
  DollarSign,
  Lock,
  Ban,
  Copyright,
  Scroll,
  Search,
  SquareCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PipelineSettingsModal } from './PipelineSettingsModal';
import { PipelineAdvancedSettingsModal } from './PipelineAdvancedSettingsModal';
import {
  type AdvancedSettings,
  ConfiguredBy,
  OnFailureAction,
} from './PipelineAdvancedSettingsModels';

interface MenuOption {
  label: string;
  action: string;
  icon?: React.ReactNode;
  danger?: boolean;
}

interface MenuCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  options: MenuOption[];
}

interface MembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  pipelineName: string;
  position: { top: number; left: number } | null;
}

interface Member {
  email: string;
  role: string;
}

function MembersModal({ isOpen, onClose, pipelineName, position }: MembersModalProps) {
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token =
          localStorage.getItem('authToken') ||
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM';

        const response = await fetch(
          `https://untolerative-len-rumblingly.ngrok-free.dev/user/get-members/${pipelineName}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'ngrok-skip-browser-warning': 'true',
            },
          },
        );

        const data = await response.json();
        if (data.status && Array.isArray(data.emails)) {
          // Normalize data in case it's still just strings in some scenarios, though requirements say objects
          const parsedMembers: Member[] = data.emails.map((item: unknown) =>
            typeof item === 'string' ? { email: item, role: 'MEMBER' } : (item as Member),
          );
          setMembers(parsedMembers);
        } else {
          console.warn('Unexpected members response format:', data);
          if (Array.isArray(data)) {
            const parsedMembers: Member[] = data.map((item: unknown) =>
              typeof item === 'string' ? { email: item, role: 'MEMBER' } : (item as Member),
            );
            setMembers(parsedMembers);
          } else {
            setError('Failed to load members.');
          }
        }
      } catch (err) {
        setError('Error fetching members.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && pipelineName) {
      fetchMembers();
    }
  }, [isOpen, pipelineName]);

  if (!isOpen || !position) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[90]" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -10 }}
        style={{
          top: position.top,
          left: position.left,
        }}
        className="fixed z-[100] w-[350px] max-h-[400px] bg-[#191919] border border-[#333] rounded-lg shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header with Search */}
        <div className="p-3 border-b border-[#2F2F2F]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members"
              className="w-full bg-[#202020] border border-[#333] rounded px-3 py-1.5 pl-8 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
            />
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-zinc-600" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252525] border border-[#2F2F2F] text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-300">
              <User className="w-3 h-3" />
              Role
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#252525] border border-[#2F2F2F] text-[10px] text-zinc-400 cursor-pointer hover:text-zinc-300">
              <SquareCheck className="w-3 h-3" />
              Status
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#191919]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-zinc-500 gap-2 h-full">
              <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading members...</span>
            </div>
          ) : error ? (
            <div className="text-red-400 text-center py-4 px-4 text-sm h-full flex items-center justify-center">
              {error}
            </div>
          ) : members.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3 py-8">
              <User className="w-8 h-8 opacity-20" />
              <span className="text-sm font-medium">No members found</span>
            </div>
          ) : (
            <div className="p-1 space-y-0.5">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded hover:bg-[#252525] group transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-[#2A2A2A] flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0 border border-[#333]">
                    {member.email[0]}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-[#E3E3E3] truncate">{member.email}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                      {member.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-[#2F2F2F] bg-[#191919]">
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500">
            <span>Managing members for {pipelineName}</span>
          </div>
        </div>
      </motion.div>
    </>,
    document.body,
  );
}

const MENU_DATA: MenuCategory[] = [
  {
    id: 'core',
    label: 'Core Pipeline Actions',
    icon: <Zap className="w-4 h-4" />,
    options: [
      { label: 'Open / View pipeline', action: 'view', icon: <Layers className="w-4 h-4" /> },
      { label: 'Start automation', action: 'start', icon: <Play className="w-4 h-4" /> },
      { label: 'Pause automation', action: 'pause', icon: <Pause className="w-4 h-4" /> },
      { label: 'Resume automation', action: 'resume', icon: <Play className="w-4 h-4" /> },
      { label: 'Dry run (simulate)', action: 'dry_run', icon: <Activity className="w-4 h-4" /> },
      { label: 'Run pipeline now', action: 'run_now', icon: <Zap className="w-4 h-4" /> },
      { label: 'Run specific step', action: 'run_step', icon: <Layers className="w-4 h-4" /> },
    ],
  },
  {
    id: 'config',
    label: 'Configuration & Settings',
    icon: <Settings className="w-4 h-4" />,
    options: [
      { label: 'General settings', action: 'edit_name', icon: <Edit3 className="w-4 h-4" /> },
      {
        label: 'Configure content source',
        action: 'config_source',
        icon: <Database className="w-4 h-4" />,
      },
      {
        label: 'Configure YouTube channel',
        action: 'config_channel',
        icon: <Tv className="w-4 h-4" />,
      },
      { label: 'Edit profile picture', action: 'edit_avatar', icon: <User className="w-4 h-4" /> },
      {
        label: 'Uploading rules',
        action: 'uploading_rules',
        icon: <UploadCloud className="w-4 h-4" />,
      },
      { label: 'Scheduling rules', action: 'rules_sched', icon: <Clock className="w-4 h-4" /> },

      {
        label: 'Advanced settings',
        action: 'additional_settings',
        icon: <Sliders className="w-4 h-4 text-yellow-500" />,
      },
    ],
  },
  {
    id: 'workflow',
    label: 'Workflow & Team',
    icon: <Users className="w-4 h-4" />,
    options: [
      { label: 'View members', action: 'view_members', icon: <User className="w-4 h-4" /> },
      { label: 'Invite members', action: 'invite_members', icon: <UserPlus className="w-4 h-4" /> },
      { label: 'Change roles', action: 'change_roles', icon: <UserCog className="w-4 h-4" /> },
      {
        label: 'Remove members',
        action: 'remove_members',
        danger: true,
        icon: <UserMinus className="w-4 h-4" />,
      },
      {
        label: 'Approval flow',
        action: 'approval_flow',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      {
        label: 'Configure stages',
        action: 'config_stages',
        icon: <GitMerge className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'content',
    label: 'Content & Automation',
    icon: <FileText className="w-4 h-4" />,
    options: [
      { label: 'View queued content', action: 'view_queued', icon: <List className="w-4 h-4" /> },
      {
        label: 'View processed',
        action: 'view_processed',
        icon: <CheckSquare className="w-4 h-4" />,
      },
      {
        label: 'Retry failed jobs',
        action: 'retry_failed',
        icon: <RefreshCw className="w-4 h-4" />,
      },
      { label: 'Skip a job', action: 'skip_job', icon: <SkipForward className="w-4 h-4" /> },
      {
        label: 'Cancel running job',
        action: 'cancel_job',
        danger: true,
        icon: <XCircle className="w-4 h-4" />,
      },
      {
        label: 'Manual override',
        action: 'manual_override',
        icon: <Sliders className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics & Intelligence',
    icon: <BarChart2 className="w-4 h-4" />,
    options: [
      {
        label: 'Analytics dashboard',
        action: 'analytics_dash',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        label: 'Video performance',
        action: 'vid_perf',
        icon: <TrendingUp className="w-4 h-4" />,
      },
      {
        label: 'CTR tracking',
        action: 'ctr_track',
        icon: <MousePointerClick className="w-4 h-4" />,
      },
      { label: 'Retention analysis', action: 'retention', icon: <UserCheck className="w-4 h-4" /> },
      {
        label: 'Underperforming alerts',
        action: 'perf_alerts',
        icon: <Bell className="w-4 h-4" />,
      },
      { label: 'Comparison', action: 'comparison', icon: <GitCompare className="w-4 h-4" /> },
    ],
  },
  {
    id: 'logs',
    label: 'Logs & History',
    icon: <History className="w-4 h-4" />,
    options: [
      { label: 'Execution logs', action: 'exec_logs', icon: <List className="w-4 h-4" /> },
      { label: 'Error logs', action: 'error_logs', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Retry history', action: 'retry_hist', icon: <RotateCcw className="w-4 h-4" /> },
      { label: 'Download logs', action: 'dl_logs', icon: <Download className="w-4 h-4" /> },
      { label: 'Audit trail', action: 'audit_trail', icon: <ClipboardList className="w-4 h-4" /> },
    ],
  },
  {
    id: 'experiment',
    label: 'Experimentation',
    icon: <Activity className="w-4 h-4" />,
    options: [
      { label: 'Clone pipeline', action: 'clone', icon: <Copy className="w-4 h-4" /> },
      {
        label: 'Create from template',
        action: 'template',
        icon: <LayoutTemplate className="w-4 h-4" />,
      },
      { label: 'Convert type', action: 'convert', icon: <RefreshCw className="w-4 h-4" /> },
      { label: 'A/B test metadata', action: 'ab_meta', icon: <Split className="w-4 h-4" /> },
      { label: 'A/B test thumbnails', action: 'ab_thumb', icon: <Image className="w-4 h-4" /> },
    ],
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: <Link className="w-4 h-4" />,
    options: [
      { label: 'Enable webhooks', action: 'webhooks', icon: <Webhook className="w-4 h-4" /> },
      { label: 'Slack/Discord alerts', action: 'alerts', icon: <BellRing className="w-4 h-4" /> },
      { label: 'Event triggers', action: 'events', icon: <Zap className="w-4 h-4" /> },
      { label: 'API access', action: 'api_access', icon: <Key className="w-4 h-4" /> },
    ],
  },
  {
    id: 'cost',
    label: 'Cost & Usage',
    icon: <CreditCard className="w-4 h-4" />,
    options: [
      { label: 'API quota usage', action: 'quota', icon: <PieChart className="w-4 h-4" /> },
      { label: 'Storage usage', action: 'storage', icon: <HardDrive className="w-4 h-4" /> },
      { label: 'Processing cost', action: 'cost', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Monthly summary', action: 'summary', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    id: 'lifecycle',
    label: 'Lifecycle',
    icon: <Archive className="w-4 h-4" />,
    options: [
      { label: 'Archive pipeline', action: 'archive', icon: <Archive className="w-4 h-4" /> },
      { label: 'Restore pipeline', action: 'restore', icon: <RotateCcw className="w-4 h-4" /> },
      { label: 'Transfer owner', action: 'transfer', icon: <ArrowRightLeft className="w-4 h-4" /> },
      {
        label: 'Delete pipeline',
        action: 'delete',
        danger: true,
        icon: <Trash2 className="w-4 h-4" />,
      },
    ],
  },
  {
    id: 'security',
    label: 'Security & Safety',
    icon: <Shield className="w-4 h-4" />,
    options: [
      { label: 'Permission matrix', action: 'permissions', icon: <Lock className="w-4 h-4" /> },
      { label: 'Restrict actions', action: 'restrict', icon: <Ban className="w-4 h-4" /> },
      { label: 'Copyright warnings', action: 'copyright', icon: <Copyright className="w-4 h-4" /> },
      { label: 'Policy checks', action: 'policy', icon: <Scroll className="w-4 h-4" /> },
    ],
  },
];

interface PipelineActionsMenuProps {
  pipeline?: {
    name: string;
    image_url?: string;
    execution_mode?: 'manual' | 'scheduled';
  };
  preloadedSettings?: AdvancedSettings;
  onRunPipeline?: (pipelineName?: string) => Promise<void> | void;
}

// ... (imports remain the same)

// New Delete Confirmation Modal Component
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pipelineName: string;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  pipelineName,
}: DeleteConfirmationModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (inputValue !== 'delete') return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#191919] border border-[#333333] rounded-xl shadow-2xl w-full max-w-md p-6 overflow-hidden"
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Delete Pipeline?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This action cannot be undone. This will permanently delete the pipeline{' '}
              <span className="text-white font-medium">"{pipelineName}"</span> and remove all
              associated data, configuration, and history.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Type "delete" to confirm
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="delete"
            className="w-full bg-[#111111] border border-[#333333] rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors font-mono"
            autoFocus
          />
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#2F2F2F] text-zinc-300 font-medium hover:text-white hover:bg-[#3F3F3F] transition-colors text-sm"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={inputValue !== 'delete' || isDeleting}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              inputValue === 'delete'
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-900/20'
                : 'bg-[#2F2F2F] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Pipeline'
            )}
          </button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}

export function PipelineActionsMenu({
  pipeline,
  preloadedSettings,
  onRunPipeline,
}: PipelineActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, align: 'right' });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [membersModalPos, setMembersModalPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const [settingsSection, setSettingsSection] = useState('general');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Filter menu options based on pipeline state
  const filteredMenuData = useMemo(() => {
    return MENU_DATA.map((category: MenuCategory) => {
      if (category.id === 'config') {
        return {
          ...category,
          options: category.options.filter((option: MenuOption) => {
            if (option.action === 'rules_sched') {
              return pipeline?.execution_mode === 'scheduled';
            }
            return true;
          }),
        };
      }
      return category;
    });
  }, [pipeline?.execution_mode]);

  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        const submenuElement = document.getElementById('pipeline-submenu-container');
        if (submenuElement && submenuElement.contains(event.target as Node)) {
          return;
        }
        setIsOpen(false);
        setActiveCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', () => {
      setIsOpen(false);
      setActiveCategory(null);
    });

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', () => {
        setIsOpen(false);
        setActiveCategory(null);
      });
    };
  }, []);

  useEffect(() => {
    if (activeCategory && categoryRefs.current[activeCategory]) {
      const el = categoryRefs.current[activeCategory];
      if (el) {
        const rect = el.getBoundingClientRect();
        const top = rect.top;
        const isRightAligned = menuPosition.align === 'right';
        const left = isRightAligned ? rect.right + 5 : rect.left - 245;
        setSubmenuPosition({ top, left });
      }
    } else {
      setSubmenuPosition(null);
    }
  }, [activeCategory, menuPosition.align]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      setActiveCategory(null);
      return;
    }

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceRight = window.innerWidth - rect.right;
      const spaceBelow = window.innerHeight - rect.bottom;

      let top = rect.top;
      let left = rect.right + 10;
      let align = 'right';

      if (spaceRight < 280) {
        left = rect.left - 270;
        align = 'left';
      }

      const menuHeight = 450;
      if (spaceBelow < menuHeight) {
        top = rect.bottom - menuHeight;
        if (top < 10) top = 10;
      } else {
        top = rect.top;
      }

      if (rect.left < 350) {
        top = rect.top;
        left = rect.right + 10;
        align = 'right';
      } else {
        top = rect.bottom + 5;
        left = rect.right - 260;
        align = 'left';
      }

      setMenuPosition({ top, left, align });
      setIsOpen(true);
    }
  };

  const handleOptionClick = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Action triggered:', action);
    setIsOpen(false);
    setActiveCategory(null);

    if (action === 'delete') {
      setIsDeleteModalOpen(true);
      return;
    }

    if (action === 'view_members') {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMembersModalPos({ top: rect.top, left: rect.right + 10 });
      setIsMembersModalOpen(true);
      return;
    }

    if (action === 'start') {
      if (onRunPipeline) {
        onRunPipeline(pipeline?.name);
      } else {
        console.warn('onRunPipeline prop not provided');
      }
      return;
    }

    if (action === 'additional_settings') {
      const fetchSettings = async () => {
        if (!pipeline?.name) {
          setIsAdvancedSettingsOpen(true);
          return;
        }

        // Use preloaded settings if available
        if (preloadedSettings) {
          setFetchedSettings(preloadedSettings);
          setIsAdvancedSettingsOpen(true);
          return;
        }

        try {
          const token =
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM';
          const response = await fetch(
            `https://untolerative-len-rumblingly.ngrok-free.dev/user/pipelines/${pipeline.name}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'true',
              },
              body: JSON.stringify({ pipelineName: pipeline.name }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            let rawPipeline = null;
            if (data.pipelines && Array.isArray(data.pipelines) && data.pipelines.length > 0) {
              rawPipeline = data.pipelines[0];
            } else if (data.pipeline) {
              rawPipeline = data.pipeline;
            } else if (data.header) {
              rawPipeline = data;
            }

            if (rawPipeline) {
              setFetchedSettings((prev) => ({
                ...prev,
                approvalFlow: {
                  ...prev.approvalFlow,
                  enabled:
                    rawPipeline.approveFlow?.enable === true ||
                    rawPipeline.configuration?.approvalFlow === true ||
                    rawPipeline.configuration?.approvalFlow?.enabled === true ||
                    rawPipeline.approval_flow?.enabled === true,
                  stages: (rawPipeline.approveFlow?.stage?.length
                    ? rawPipeline.approveFlow.stage
                    : null) ??
                    (rawPipeline.configuration?.stages?.length
                      ? rawPipeline.configuration.stages
                      : null) ??
                    (rawPipeline.configuration?.stage?.length
                      ? rawPipeline.configuration.stage
                      : null) ??
                    (rawPipeline.configuration?.approvalFlow?.stages?.length
                      ? rawPipeline.configuration.approvalFlow.stages
                      : null) ??
                    (rawPipeline.configuration?.approvalFlow?.stage?.length
                      ? rawPipeline.configuration.approvalFlow.stage
                      : null) ??
                    (rawPipeline.approval_flow?.flow?.length
                      ? rawPipeline.approval_flow.flow
                      : null) ?? ['Editor', 'Reviewer', 'Admin'],
                },
                executionLimits: {
                  ...prev.executionLimits,
                  maxConcurrentRuns:
                    rawPipeline.adminLimits?.execution?.maxConcurrentRuns ??
                    rawPipeline.admin_settings?.maxConcurrentRuns ??
                    1,
                  maxDailyUploads:
                    rawPipeline.adminLimits?.resources?.dailyUploads ??
                    rawPipeline.admin_settings?.dailyUploadQuota ??
                    6,
                  maxFileSizeMB:
                    rawPipeline.adminLimits?.resources?.memoryMB ??
                    rawPipeline.admin_settings?.memoryLimitMB ??
                    2048,
                  totalStorageMB:
                    rawPipeline.adminLimits?.resources?.storageMB ??
                    rawPipeline.adminLimits?.resources?.[' '] ??
                    rawPipeline.admin_settings?.storageQuotaMB ??
                    10240,
                  timeoutPerStepSeconds:
                    rawPipeline.adminLimits?.execution?.timeoutPerStepSeconds ??
                    rawPipeline.admin_settings?.timeoutPerStepSeconds ??
                    300,
                  autoDisableAfterFailures:
                    rawPipeline.adminLimits?.safety?.autoDisableAfterFailures ??
                    rawPipeline.admin_settings?.autoDisableAfterFailures ??
                    3,
                  cpuLimit:
                    rawPipeline.adminLimits?.resources?.cpu ??
                    rawPipeline.admin_settings?.cpuLimit ??
                    1,
                  retryCount:
                    rawPipeline.adminLimits?.execution?.retryCount ??
                    rawPipeline.admin_settings?.retryCount ??
                    2,
                  configuredBy:
                    rawPipeline.adminLimits?.configuredBy ??
                    rawPipeline.admin_settings?.configuredBy ??
                    ConfiguredBy.SYSTEM,
                },
                safety: {
                  ...prev.safety,
                  configLock:
                    rawPipeline.adminLimits?.safety?.locked ??
                    rawPipeline.admin_settings?.lockCriticalSettings ??
                    false,
                  auditTrail:
                    rawPipeline.adminLimits?.safety?.auditTrailEnabled ??
                    rawPipeline.admin_settings?.auditTrailEnabled ??
                    true,
                  onFailureAction:
                    (rawPipeline.adminLimits?.safety?.onFailureAction as OnFailureAction) ||
                    (rawPipeline.admin_settings?.onFailureAction as OnFailureAction) ||
                    OnFailureAction.NONE,
                },
                events: {
                  ...prev.events,
                  onSuccessWebhook:
                    rawPipeline.adminLimits?.integrations?.webhooks?.onSuccess?.url ??
                    rawPipeline.admin_settings?.onSuccessWebhook ??
                    '',
                  onFailureWebhook:
                    rawPipeline.adminLimits?.integrations?.webhooks?.onFailure?.url ??
                    rawPipeline.admin_settings?.onFailureWebhook ??
                    '',
                  webhookSettings: {
                    timeoutSeconds:
                      rawPipeline.adminLimits?.integrations?.webhooks?.onSuccess?.timeoutSeconds ??
                      5,
                    behavior: {
                      nonBlocking:
                        rawPipeline.adminLimits?.integrations?.behavior?.nonBlocking ?? true,
                    },
                  },
                  alerts: {
                    slack: {
                      enabled:
                        rawPipeline.adminLimits?.integrations?.alerts?.slack?.enabled ?? false,
                      webhook:
                        rawPipeline.adminLimits?.integrations?.alerts?.slack?.webhookUrl ?? '',
                    },
                    discord: {
                      enabled:
                        rawPipeline.adminLimits?.integrations?.alerts?.discord?.enabled ?? false,
                      webhook:
                        rawPipeline.adminLimits?.integrations?.alerts?.discord?.webhookUrl ?? '',
                    },
                  },
                },
                scheduling: {
                  enabled:
                    rawPipeline.header?.executionMode === 'scheduled' ||
                    rawPipeline.execution_mode === 'scheduled' ||
                    false,
                  timezone:
                    rawPipeline.configuration?.schedule?.timezone ||
                    rawPipeline.schedule_config?.timezone ||
                    'UTC',
                  frequency:
                    rawPipeline.configuration?.schedule?.frequency ||
                    rawPipeline.schedule_config?.frequency ||
                    'cron',
                  cronExpression:
                    rawPipeline.configuration?.schedule?.cronExpression ||
                    rawPipeline.schedule_config?.cronExpression,
                  intervalMinutes:
                    rawPipeline.configuration?.schedule?.intervalMinutes ||
                    rawPipeline.schedule_config?.intervalMinutes,
                },
              }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch pipeline settings:', error);
        } finally {
          setIsAdvancedSettingsOpen(true);
        }
      };

      fetchSettings();
      return;
    }

    const actionMap: Record<string, string> = {
      edit_name: 'general',
      edit_avatar: 'avatar',
      uploading_rules: 'metadata',
      rules_sched: 'scheduling',
      config_source: 'source',
      config_channel: 'youtube',
    };

    if (actionMap[action]) {
      if (!pipeline) {
        console.warn('Pipeline data not provided to ActionsMenu, cannot open settings.');
        return;
      }
      setSettingsSection(actionMap[action]);
      setIsSettingsModalOpen(true);
    }
  };

  const [fetchedSettings, setFetchedSettings] = useState<AdvancedSettings>({
    approvalFlow: { enabled: false, stages: ['Editor', 'Reviewer', 'Admin'] },
    executionLimits: {
      maxConcurrentRuns: 1,
      maxDailyUploads: 6,
      maxFileSizeMB: 2048,
      totalStorageMB: 10240,
      timeoutPerStepSeconds: 300,
      autoDisableAfterFailures: 3,
      cpuLimit: 1,
      retryCount: 2,
      configuredBy: ConfiguredBy.SYSTEM,
    },
    events: {
      onSuccessWebhook: '',
      onFailureWebhook: '',
      alerts: {
        slack: { enabled: false, webhook: '' },
        discord: { enabled: false, webhook: '' },
      },
    },
    safety: { configLock: false, onFailureAction: OnFailureAction.NONE, auditTrail: true },
    observability: {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastRunAt: 'Never',
      lastSuccessAt: 'Never',
      lastFailureAt: 'Never',
    },
  });

  const handleSaveAdvancedSettings = async (settings: AdvancedSettings) => {
    if (pipeline?.name) {
      try {
        const payload = {
          approvalFlow: {
            enable: settings.approvalFlow.enabled,
            stage: settings.approvalFlow.stages,
          },
          adminSettings: {
            cpuLimit: settings.executionLimits.cpuLimit,
            retryCount: settings.executionLimits.retryCount,
            configuredBy: settings.executionLimits.configuredBy,
            memoryLimitMB: settings.executionLimits.maxFileSizeMB,
            storageQuotaMB: settings.executionLimits.totalStorageMB,
            onFailureAction: settings.safety.onFailureAction,
            dailyUploadQuota: settings.executionLimits.maxDailyUploads,
            auditTrailEnabled: settings.safety.auditTrail,
            maxConcurrentRuns: settings.executionLimits.maxConcurrentRuns,
            lockCriticalSettings: settings.safety.configLock,
            timeoutPerStepSeconds: settings.executionLimits.timeoutPerStepSeconds,
            autoDisableAfterFailures: settings.executionLimits.autoDisableAfterFailures,
          },
          integrations: {
            webhooks: {
              onSuccess: {
                enabled: !!settings.events.onSuccessWebhook,
                url: settings.events.onSuccessWebhook || null,
                timeoutSeconds: settings.events.webhookSettings?.timeoutSeconds || 30,
              },
              onFailure: {
                enabled: !!settings.events.onFailureWebhook,
                url: settings.events.onFailureWebhook || null,
                timeoutSeconds: settings.events.webhookSettings?.timeoutSeconds || 30,
              },
            },
            alerts: {
              slack: {
                enabled: settings.events.alerts.slack.enabled,
                webhookUrl: settings.events.alerts.slack.webhook || null,
              },
              discord: {
                enabled: settings.events.alerts.discord.enabled,
                webhookUrl: settings.events.alerts.discord.webhook || null,
              },
            },
            behavior: {
              nonBlocking: settings.events.webhookSettings?.behavior?.nonBlocking ?? true,
            },
          },
        };

        const response = await fetch(
          `https://untolerative-len-rumblingly.ngrok-free.dev/user/update-advancedsettings/${pipeline.name}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization:
                'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM',
            },
            body: JSON.stringify(payload),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to update advanced settings');
        }

        const data = await response.json();
        console.log('Advanced settings updated:', data);

        // Update local state if needed
        setFetchedSettings(settings);
      } catch (error) {
        console.error('Error updating advanced settings:', error);
      }
    }
    console.log('Saved advanced settings:', settings);
    setIsAdvancedSettingsOpen(false);
  };

  const handleDeletePipeline = async () => {
    if (!pipeline?.name) return;

    try {
      const response = await fetch(
        `https://untolerative-len-rumblingly.ngrok-free.dev/user/delete-pipeline/${pipeline.name}`,
        {
          method: 'DELETE',
          headers: {
            Authorization:
              'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZDUyMTFkMi1kODY5LTQwMTctYjdkNi01NDljMTQzYTYyYmQiLCJpYXQiOjE3NjcwMjIyNjQsImV4cCI6MTc2NzYyNzA2NH0.EA5Pfu0vIkHI5SatbEbZ6HLw2y6QStoXOALz5cRJTiM',
          },
        },
      );

      const data = await response.json();

      if (data.status === true) {
        setIsDeleteModalOpen(false);
        window.location.reload();
      } else {
        console.error('Failed to delete pipeline: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting pipeline:', error);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className={`p-1.5 rounded-lg transition-colors ${
          isOpen
            ? 'bg-[#2F2F2F] text-[#D4D4D4]'
            : 'text-zinc-400 hover:text-white hover:bg-white/10'
        }`}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Main Menu Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-50 pointer-events-none">
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, x: menuPosition.align === 'right' ? -10 : 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: menuPosition.align === 'right' ? -10 : 10 }}
                transition={{ duration: 0.1 }}
                className="fixed w-64 rounded-lg border border-[#2F2F2F] bg-[#191919] shadow-xl pointer-events-auto flex flex-col py-1"
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                  maxHeight: '80vh',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="flex flex-col overflow-y-auto custom-scrollbar"
                  onScroll={() => setActiveCategory(null)}
                >
                  {filteredMenuData.map((category) => {
                    const isActive = activeCategory === category.id;

                    return (
                      <div
                        key={category.id}
                        className="relative group px-1 mb-0.5"
                        onMouseEnter={() => setActiveCategory(category.id)}
                      >
                        <button
                          ref={(el) => (categoryRefs.current[category.id] = el)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive
                              ? 'bg-[#2F2F2F] text-[#D4D4D4]'
                              : 'text-[#9B9A97] hover:text-[#D4D4D4] hover:bg-[#2F2F2F]'
                          }`}
                          onClick={() => setActiveCategory(isActive ? null : category.id)}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`${
                                isActive
                                  ? 'text-[#D4D4D4]'
                                  : 'text-[#9B9A97] group-hover:text-[#D4D4D4]'
                              }`}
                            >
                              {category.icon}
                            </span>
                            <span className="font-medium">{category.label}</span>
                          </div>
                          <ChevronRight
                            className={`w-4 h-4 text-[#9B9A97] ${isActive ? 'text-[#D4D4D4]' : ''}`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Submenu Portal */}
      {createPortal(
        <AnimatePresence>
          {isOpen && activeCategory && submenuPosition && (
            <motion.div
              id="pipeline-submenu-container"
              initial={{ opacity: 0, x: menuPosition.align === 'right' ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed w-60 rounded-lg border border-[#2F2F2F] bg-[#191919] shadow-xl overflow-hidden z-[60] pointer-events-auto"
              style={{
                top: submenuPosition.top,
                left: submenuPosition.left,
              }}
            >
              {(() => {
                const category = filteredMenuData.find((c) => c.id === activeCategory);
                if (!category) return null;

                return (
                  <div className="py-1.5 flex flex-col max-h-[320px] overflow-y-auto custom-scrollbar">
                    <div className="px-3 py-2 text-xs font-semibold text-[#9B9A97] uppercase tracking-wider border-b border-[#2F2F2F] mb-1">
                      {category.label}
                    </div>
                    {category.options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => handleOptionClick(option.action, e)}
                        className={`
                                 w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors relative rounded-md
                                 ${
                                   option.danger
                                     ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                                     : 'text-[#D4D4D4] hover:bg-[#2F2F2F]'
                                 }
                              `}
                      >
                        {option.icon ? (
                          <span
                            className={`flex-shrink-0 w-4 h-4 flex items-center justify-center ${
                              option.danger ? 'text-red-500' : 'text-[#9B9A97]'
                            }`}
                          >
                            {option.icon}
                          </span>
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0" />
                        )}
                        <span className="truncate">{option.label}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {/* Settings Modal */}
      <PipelineSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        pipelineName={pipeline?.name}
        initialSection={settingsSection}
      />

      {/* Advanced Settings Modal */}
      <PipelineAdvancedSettingsModal
        isOpen={isAdvancedSettingsOpen}
        onClose={() => setIsAdvancedSettingsOpen(false)}
        onSave={handleSaveAdvancedSettings}
        initialSettings={fetchedSettings}
        initialTab="approval"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePipeline}
        pipelineName={pipeline?.name || ''}
      />

      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        pipelineName={pipeline?.name || ''}
        position={membersModalPos}
      />
    </>
  );
}
