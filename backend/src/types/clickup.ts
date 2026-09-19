export interface ClickUpUser {
  id: number | string;
  username: string;
  email?: string;
  color?: string;
  profilePicture?: string | null;
  initials?: string;
}

export interface ClickUpStatus {
  id?: string;
  status: string;
  type: string;
  orderindex?: number;
  color?: string;
}

export interface ClickUpPriority {
  id?: string;
  priority: string;
  color?: string;
  orderindex?: string;
}

export interface ClickUpTask {
  id: string;
  custom_id?: string | null;
  name: string;
  status: ClickUpStatus;
  orderindex?: string;
  date_created?: string;
  date_updated?: string;
  date_closed?: string | null;
  date_done?: string | null;
  archived?: boolean;
  creator?: ClickUpUser;
  assignees: ClickUpUser[];
  watchers?: ClickUpUser[];
  checklists?: unknown[];
  tags?: unknown[];
  parent?: string | null;
  priority?: ClickUpPriority | null;
  due_date?: string | null;
  start_date?: string | null;
  points?: number | null;
  time_estimate?: number | null;
  time_spent?: number | null;
  custom_fields?: unknown[];
  url?: string;
  list: {
    id: string;
    name: string;
    access?: boolean;
  };
  project?: {
    id: string;
    name: string;
    hidden?: boolean;
    access?: boolean;
  };
  folder?: {
    id: string;
    name: string;
    hidden?: boolean;
    access?: boolean;
  };
  space?: {
    id: string;
  };
}

export interface ClickUpTeam {
  id: string;
  name: string;
  color?: string;
  avatar?: string | null;
  members?: Array<{ user: ClickUpUser }>;
}

export interface ClickUpSpace {
  id: string;
  name: string;
  private?: boolean;
  statuses?: ClickUpStatus[];
  multiple_assignees?: boolean;
  archived?: boolean;
}

export interface ClickUpFolder {
  id: string;
  name: string;
  orderindex?: number;
  override_statuses?: boolean;
  hidden?: boolean;
  space?: {
    id: string;
    name: string;
  };
  lists?: ClickUpList[];
  archived?: boolean;
}

export interface ClickUpList {
  id: string;
  name: string;
  orderindex?: number;
  status?: ClickUpStatus;
  priority?: ClickUpPriority;
  assignee?: ClickUpUser;
  task_count?: number;
  due_date?: string;
  start_date?: string;
  folder?: {
    id: string;
    name: string;
    hidden?: boolean;
    access?: boolean;
  };
  space?: {
    id: string;
    name: string;
    access?: boolean;
  };
  archived?: boolean;
}
