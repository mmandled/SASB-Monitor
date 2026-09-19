import React from 'react';
import { X, ExternalLink, CheckCircle2, Clock, Calendar, Tag, AlertCircle } from 'lucide-react';
import type { MemberStats, NormalizedTask } from '../types/index.js';
import { formatDate, getAvatarBgColor } from '../lib/utils.js';

interface MemberDetailModalProps {
  member: MemberStats | null;
  onClose: () => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        id="modal-member-detail"
        className="relative w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {member.profilePicture ? (
                <img
                  src={member.profilePicture}
                  alt={member.memberName}
                  className="w-14 h-14 rounded-full object-cover shrink-0 ring-2 ring-blue-500/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className={`w-14 h-14 rounded-full text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm ${getAvatarBgColor(
                    member.memberName
                  )}`}
                >
                  {member.initials || member.memberName.slice(0, 2).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                  {member.memberName}
                </h2>
                {member.email && (
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {member.email}
                  </p>
                )}
                <span className="inline-block mt-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                  SAS Bulletin Member
                </span>
              </div>
            </div>

            <button
              id="btn-close-member-modal"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5 mt-5">
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
              <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">
                Assigned
              </span>
              <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {member.assigned}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
              <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">
                Completed
              </span>
              <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {member.completed}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
              <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">
                Active
              </span>
              <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {member.active}
              </span>
            </div>

            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 text-center">
              <span className="block text-[10px] font-bold text-neutral-400 dark:text-neutral-400 uppercase tracking-wider">
                Rate
              </span>
              <span className="text-xl font-extrabold text-neutral-900 dark:text-neutral-100">
                {member.completionRateFormatted}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[55vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Assigned Tasks ({member.tasks.length})
            </h3>
          </div>

          {member.tasks.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 rounded-xl">
              No tasks currently recorded for this member.
            </div>
          ) : (
            <div className="space-y-2.5">
              {member.tasks.map((task) => (
                <div
                  key={task.id}
                  id={`task-item-${task.id}`}
                  className="p-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {task.isCompleted ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          <CheckCircle2 size={14} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                          <Clock size={13} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {task.name}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-medium text-neutral-700 dark:text-neutral-300">
                          {task.listName || task.month}
                        </span>

                        <span className={`px-2 py-0.5 rounded-md font-semibold ${
                          task.isCompleted
                            ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                            : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {task.status}
                        </span>

                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-neutral-500">
                            <Calendar size={11} />
                            <span>{formatDate(task.dueDate)}</span>
                          </span>
                        )}

                        {task.priority && (
                          <span className="flex items-center gap-1 text-neutral-500 uppercase font-mono text-[10px]">
                            <Tag size={10} />
                            <span>{task.priority}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <a
                    href={task.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 rounded-lg transition-colors shrink-0 self-end sm:self-center"
                    title="Open task in ClickUp"
                  >
                    <span>Open in ClickUp</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
