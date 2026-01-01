import { useState, useRef, useEffect } from 'react';
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
  Globe,
  Clock,
  AlertTriangle,
  Edit3,
  Database,
  Tv,
  UploadCloud,
  Tag,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      { label: 'Edit pipeline name', action: 'edit_name', icon: <Edit3 className="w-4 h-4" /> },
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
      { label: 'Upload rules', action: 'rules_upload', icon: <UploadCloud className="w-4 h-4" /> },
      { label: 'Scheduling rules', action: 'rules_sched', icon: <Clock className="w-4 h-4" /> },
      { label: 'Metadata strategy', action: 'meta_strat', icon: <Tag className="w-4 h-4" /> },
      { label: 'Thumbnail rules', action: 'thumb_rules', icon: <Image className="w-4 h-4" /> },
      { label: 'Language & region', action: 'lang_settings', icon: <Globe className="w-4 h-4" /> },
      {
        label: 'Additional settings',
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

export function PipelineActionsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, align: 'right' }); // Added align

  // Ref for the active category button to calculate submenu position
  // We need to store refs for all category buttons
  const categoryRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate submenu position based on the active category element
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside regular menu
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        // Also need to check if click is outside the SUBMENU (since it will be portaled now)
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

    // Also close on scroll if needed, but 'fixed' position handles page scroll.
    // Menu internal scroll is handled by updating position? No, fixed position stays.

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', () => {
        setIsOpen(false);
        setActiveCategory(null);
      });
    };
  }, []);

  // Update submenu position when activeCategory changes
  useEffect(() => {
    if (activeCategory && categoryRefs.current[activeCategory]) {
      const el = categoryRefs.current[activeCategory];
      if (el) {
        const rect = el.getBoundingClientRect();
        // Calculate position
        let top = rect.top;
        // Align with the menu logic
        const isRightAligned = menuPosition.align === 'right';
        let left = isRightAligned ? rect.right + 5 : rect.left - 245; // 240 width + margin

        // Clamp vertically if needed? (Not implementing full collision detection for now)
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

      // Simplified override logic based on placement:
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
                  // Clear active category on scroll to avoid detached submenus
                  onScroll={() => setActiveCategory(null)}
                >
                  {MENU_DATA.map((category) => {
                    const isActive = activeCategory === category.id;

                    return (
                      <div
                        key={category.id}
                        className="relative group px-1 mb-0.5"
                        onMouseEnter={() => setActiveCategory(category.id)}
                        // Main button for category
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

      {/* Submenu Portal - Rendered separately to escape overflow clipping */}
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
                const category = MENU_DATA.find((c) => c.id === activeCategory);
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
    </>
  );
}
