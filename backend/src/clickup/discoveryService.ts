import { ClickUpClient } from "./clickupClient.js";
import type {
  ClickUpTeam,
  ClickUpSpace,
  ClickUpFolder,
  ClickUpList,
} from "../types/clickup.js";

export interface DiscoveredTarget {
  team: { id: string; name: string };
  space: { id: string; name: string };
  folder: { id: string; name: string };
  lists: Array<{
    id: string;
    name: string;
    month: string;
    taskCount?: number;
  }>;
}

export class DiscoveryService {
  private client: ClickUpClient;

  constructor(client: ClickUpClient) {
    this.client = client;
  }

  private normalize(str: string): string {
    return str
      .toLowerCase()
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  }

  public static deriveMonthName(listName: string, folderName?: string): string {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const cleanListName = listName.trim();
    const lowerListName = cleanListName.toLowerCase();

    for (const m of months) {
      if (lowerListName.includes(m.toLowerCase())) {
        const yearMatch = cleanListName.match(/20\d\d/);
        return yearMatch ? `${m} ${yearMatch[0]}` : m;
      }
    }

    if (folderName) {
      const lowerFolder = folderName.toLowerCase();
      for (const m of months) {
        if (lowerFolder.includes(m.toLowerCase())) {
          const yearMatch = folderName.match(/20\d\d/);
          return yearMatch ? `${m} ${yearMatch[0]}` : m;
        }
      }
    }

    return cleanListName;
  }

  public async discoverHierarchy(): Promise<DiscoveredTarget> {
    const configuredTeamId = process.env.CLICKUP_TEAM_ID?.trim();
    const configuredSpaceId = process.env.CLICKUP_SPACE_ID?.trim();
    const configuredFolderId = process.env.CLICKUP_PROJECT_FOLDER_ID?.trim();

    const teams = await this.client.getTeams();
    if (!teams || teams.length === 0) {
      throw new Error(
        "No ClickUp workspaces found for the provided API token.",
      );
    }

    let resolvedTeamId = configuredTeamId;
    let resolvedSpaceId = configuredSpaceId;
    if (
      configuredSpaceId &&
      teams.some((t) => String(t.id) === configuredSpaceId)
    ) {
      resolvedTeamId = configuredSpaceId;
      resolvedSpaceId = configuredTeamId;
    }

    let targetTeam: { id: string; name: string };
    if (resolvedTeamId) {
      const matched = teams.find((t) => String(t.id) === resolvedTeamId);
      targetTeam = matched
        ? { id: String(matched.id), name: matched.name }
        : { id: resolvedTeamId, name: `Workspace (${resolvedTeamId})` };
    } else {
      const sasbTeam = teams.find((t) =>
        this.normalize(t.name).includes("sas bulletin"),
      );
      const selected = sasbTeam || teams[0];
      targetTeam = { id: String(selected.id), name: selected.name };
    }

    let targetSpace: { id: string; name: string };
    const spaces = await this.client.getSpaces(targetTeam.id);
    if (!spaces || spaces.length === 0) {
      throw new Error(
        `No spaces found in workspace "${targetTeam.name}" (ID: ${targetTeam.id}).`,
      );
    }

    if (resolvedSpaceId) {
      const matched = spaces.find((s) => String(s.id) === resolvedSpaceId);
      targetSpace = matched
        ? { id: String(matched.id), name: matched.name }
        : { id: resolvedSpaceId, name: `Space (${resolvedSpaceId})` };
    } else {
      const sasbSpace = spaces.find((s) => {
        const norm = this.normalize(s.name);
        return (
          norm.includes("sasb 26-27") ||
          norm.includes("sasb 26–27") ||
          norm.includes("sasb")
        );
      });
      const selected = sasbSpace || spaces[0];
      targetSpace = { id: String(selected.id), name: selected.name };
    }

    let targetFolder: { id: string; name: string } = {
      id: "",
      name: "Workspace Folders",
    };
    const folders = await this.client.getFolders(targetSpace.id);

    const nonArchiveFolders = folders.filter((f) => {
      const norm = this.normalize(f.name);
      return !norm.includes("archive");
    });

    if (configuredFolderId) {
      const matched = folders.find((f) => String(f.id) === configuredFolderId);
      if (matched) {
        targetFolder = { id: String(matched.id), name: matched.name };
      } else {
        targetFolder = {
          id: configuredFolderId,
          name: `Folder (${configuredFolderId})`,
        };
      }
    } else {
      const projectFolder = nonArchiveFolders.find((f) => {
        const norm = this.normalize(f.name);
        return norm === "project" || norm.startsWith("project");
      });
      if (projectFolder) {
        targetFolder = {
          id: String(projectFolder.id),
          name: projectFolder.name,
        };
      } else if (nonArchiveFolders.length > 0) {
        targetFolder = {
          id: String(nonArchiveFolders[0].id),
          name: nonArchiveFolders[0].name,
        };
      }
    }

    interface DiscoveredListMeta {
      id: string;
      name: string;
      month: string;
      taskCount?: number;
    }

    const discoveredLists: DiscoveredListMeta[] = [];

    if (configuredFolderId) {
      const listsInFolder = await this.client.getListsInFolder(targetFolder.id);
      for (const l of listsInFolder) {
        if (!l.archived && !this.normalize(l.name).includes("archive")) {
          discoveredLists.push({
            id: String(l.id),
            name: l.name,
            month: DiscoveryService.deriveMonthName(l.name, targetFolder.name),
            taskCount: l.task_count,
          });
        }
      }
    }

    if (discoveredLists.length === 0) {
      for (const folder of nonArchiveFolders) {
        const folderLists = await this.client.getListsInFolder(folder.id);
        for (const l of folderLists) {
          if (!l.archived && !this.normalize(l.name).includes("archive")) {
            discoveredLists.push({
              id: String(l.id),
              name: l.name,
              month: DiscoveryService.deriveMonthName(l.name, folder.name),
              taskCount: l.task_count,
            });
          }
        }
      }

      const spaceLists = await this.client.getFolderlessLists(targetSpace.id);
      for (const l of spaceLists) {
        if (!l.archived && !this.normalize(l.name).includes("archive")) {
          discoveredLists.push({
            id: String(l.id),
            name: l.name,
            month: DiscoveryService.deriveMonthName(l.name),
            taskCount: l.task_count,
          });
        }
      }
    }

    return {
      team: targetTeam,
      space: targetSpace,
      folder: targetFolder,
      lists: discoveredLists,
    };
  }
}
