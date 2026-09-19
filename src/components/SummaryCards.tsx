// src\components\SummaryCards.tsx
import React from 'react';
import { Users, CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface SummaryCardsProps {
  totalMembers: number;
  totalAssigned: number;
  totalCompleted: number;
  totalActive: number;
  isLoading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalMembers,
  totalAssigned,
  totalCompleted,
  totalActive,
  isLoading = false
}) => {
  const cards = [
    {
      id: 'card-total-members',
      label: 'TOTAL MEMBERS',
      value: totalMembers,
      sublabel: 'Active',
      icon: Users,
      iconColor: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40'
    },
    {
      id: 'card-assigned-tasks',
      label: 'ASSIGNED TASKS',
      value: totalAssigned,
      sublabel: 'Total task',
      icon: ListTodo,
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40'
    },
    {
      id: 'card-completed-tasks',
      label: 'COMPLETED',
      value: totalCompleted,
      sublabel: 'Tasks marked done',
      icon: CheckCircle2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 dark:bg-blue-950/30'
    },
    {
      id: 'card-active-tasks',
      label: 'ACTIVE',
      value: totalActive,
      sublabel: 'In progress / pending',
      icon: Clock,
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 animate-pulse space-y-3"
          >
            <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-8 w-16 bg-neutral-300 dark:bg-neutral-700 rounded" />
            <div className="h-2.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-150 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                {card.label}
              </span>
              <div className={`p-2 rounded-lg ${card.bgColor} ${card.iconColor}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
                {card.value.toLocaleString()}
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {card.sublabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
