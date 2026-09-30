import { google, sheets_v4 } from "googleapis";
import type {
  DashboardSummary,
  MemberStats,
  NormalizedTask,
} from "../types/analytics.js";
import { getMemberPositions } from "./positionService.js";

const DASHBOARD_SHEET = "Dashboard";
const MEMBERS_SHEET = "Members";
const TASKS_SHEET = "Tasks";

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets | null = null;
  private spreadsheetId: string;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim() || "";
  }

  public isConfigured(): boolean {
    return Boolean(
      this.spreadsheetId &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() &&
      process.env.GOOGLE_PRIVATE_KEY?.trim(),
    );
  }

  private getSheetsClient(): sheets_v4.Sheets {
    if (this.sheets) return this.sheets;

    if (!this.isConfigured()) {
      throw new Error(
        "Google Sheets is not configured. Check the Google Sheets environment variables.",
      );
    }

    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!.trim(),
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n").trim(),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({
      version: "v4",
      auth,
    });

    return this.sheets;
  }

  public async syncReport(data: {
    summary: DashboardSummary;
    members: MemberStats[];
    tasks: NormalizedTask[];
    lastSynced: string;
  }): Promise<void> {
    const sheets = this.getSheetsClient();

    await this.ensureSheets(sheets);

    const savedPositions = await getMemberPositions();

    const positionMap = new Map(
      savedPositions.map((item) => [String(item.clickupUserId), item.position]),
    );

    const dashboardRows = this.buildDashboardRows(data.summary);
    const memberRows = this.buildMemberRows(data.members, positionMap);
    const taskRows = this.buildTaskRows(data.tasks);

    await sheets.spreadsheets.values.batchClear({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        ranges: [
          `${DASHBOARD_SHEET}!A:Z`,
          `${MEMBERS_SHEET}!A:Z`,
          `${TASKS_SHEET}!A:Z`,
        ],
      },
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        valueInputOption: "USER_ENTERED",
        data: [
          {
            range: `${DASHBOARD_SHEET}!A1`,
            values: dashboardRows,
          },
          {
            range: `${MEMBERS_SHEET}!A1`,
            values: memberRows,
          },
          {
            range: `${TASKS_SHEET}!A1`,
            values: taskRows,
          },
        ],
      },
    });

    await this.formatSheets(sheets);

    console.log(
      `[GoogleSheetsService] Synced ${data.tasks.length} tasks and ${data.members.length} members to Google Sheets.`,
    );
  }

  private async ensureSheets(sheets: sheets_v4.Sheets): Promise<void> {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      fields: "sheets.properties",
    });

    const existing =
      spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title) || [];

    const required = [DASHBOARD_SHEET, MEMBERS_SHEET, TASKS_SHEET];

    const missing = required.filter((title) => !existing.includes(title));

    if (missing.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: missing.map((title) => ({
            addSheet: {
              properties: { title },
            },
          })),
        },
      });
    }
  }

  private buildDashboardRows(summary: DashboardSummary): (string | number)[][] {
    return [
      ["SASB Bulletin Task Monitor"],
      [],
      ["Total Members", summary.totalMembers],
      ["Total Assignments", summary.totalAssigned],
      ["Completed", summary.totalCompleted],
      ["Remaining", summary.totalActive],
      ["Completion Rate", summary.overallCompletionFormatted],
      [],
      ["Monthly Summary"],
      ["Month", "Assigned", "Completed", "Remaining", "Completion Rate"],
      ...summary.monthlyStats.map((month) => [
        month.month,
        month.assigned,
        month.completed,
        month.active,
        month.completionRateFormatted,
      ]),
    ];
  }

  private buildMemberRows(
    members: MemberStats[],
    positionMap: Map<string, string>,
  ): (string | number)[][] {
    return [
      [
        "Member",
        "Email",
        "Position",
        "Assigned",
        "Completed",
        "Remaining",
        "Completion Rate",
      ],
      ...members.map((member) => [
        member.memberName,
        member.email || "",
        positionMap.get(String(member.memberId)) || "",
        member.assigned,
        member.completed,
        member.active,
        member.completionRateFormatted,
      ]),
    ];
  }

  private buildTaskRows(tasks: NormalizedTask[]): (string | number)[][] {
    const rows: (string | number)[][] = [
      [
        "Task Name",
        "Assignee",
        "Assignee Email",
        "Status",
        "Due Date",
        "Priority",
        "Month",
        "List",
      ],
    ];

    for (const task of tasks) {
      if (task.assignees.length > 0) {
        for (const assignee of task.assignees) {
          rows.push([
            task.name,
            assignee.username,
            assignee.email || "",
            task.status,
            task.dueDate
              ? new Date(task.dueDate).toLocaleDateString("en-CA")
              : "",
            task.priority || "",
            task.month,
            task.listName,
          ]);
        }
      } else {
        rows.push([
          task.name,
          "Unassigned",
          "",
          task.status,
          task.dueDate || "",
          task.priority || "",
          task.month,
          task.listName,
        ]);
      }
    }

    return rows;
  }

  private async formatSheets(sheets: sheets_v4.Sheets): Promise<void> {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
      fields: "sheets.properties",
    });

    const ids = new Map<string, number>();

    for (const sheet of spreadsheet.data.sheets || []) {
      const title = sheet.properties?.title;
      const id = sheet.properties?.sheetId;

      if (title && id !== undefined && id !== null) {
        ids.set(title, id);
      }
    }

    const dashboardId = ids.get(DASHBOARD_SHEET);
    const membersId = ids.get(MEMBERS_SHEET);
    const tasksId = ids.get(TASKS_SHEET);

    const requests: sheets_v4.Schema$Request[] = [];

    // DASHBOARD
    if (dashboardId !== undefined) {
      requests.push(
        {
          repeatCell: {
            range: {
              sheetId: dashboardId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 5,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.12,
                  green: 0.35,
                  blue: 0.7,
                },
                textFormat: {
                  bold: true,
                  fontSize: 16,
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                },
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat",
          },
        },

        {
          repeatCell: {
            range: {
              sheetId: dashboardId,
              startRowIndex: 2,
              endRowIndex: 7,
              startColumnIndex: 0,
              endColumnIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: {
                  bold: true,
                },
              },
            },
            fields: "userEnteredFormat.textFormat",
          },
        },

        // Monthly Summary title
        {
          repeatCell: {
            range: {
              sheetId: dashboardId,
              startRowIndex: 8,
              endRowIndex: 9,
              startColumnIndex: 0,
              endColumnIndex: 5,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.12,
                  green: 0.35,
                  blue: 0.7,
                },
                textFormat: {
                  bold: true,
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                },
              },
            },
            fields: "userEnteredFormat",
          },
        },

        {
          repeatCell: {
            range: {
              sheetId: dashboardId,
              startRowIndex: 9,
              endRowIndex: 10,
              startColumnIndex: 0,
              endColumnIndex: 5,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.85,
                  green: 0.85,
                  blue: 0.85,
                },
                textFormat: {
                  bold: true,
                },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: dashboardId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 1,
            },
            properties: {
              pixelSize: 180,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: dashboardId,
              dimension: "COLUMNS",
              startIndex: 1,
              endIndex: 5,
            },
            properties: {
              pixelSize: 125,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: dashboardId,
              dimension: "ROWS",
              startIndex: 0,
              endIndex: 1,
            },
            properties: {
              pixelSize: 42,
            },
            fields: "pixelSize",
          },
        },
      );
    }

    // MEMBERS
    if (membersId !== undefined) {
      requests.push(
        {
          updateSheetProperties: {
            properties: {
              sheetId: membersId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: "gridProperties.frozenRowCount",
          },
        },

        {
          repeatCell: {
            range: {
              sheetId: membersId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.12,
                  green: 0.35,
                  blue: 0.7,
                },
                textFormat: {
                  bold: true,
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                },
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: membersId,
              dimension: "COLUMNS",
              startIndex: 2,
              endIndex: 3,
            },
            properties: {
              pixelSize: 210,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: membersId,
              dimension: "COLUMNS",
              startIndex: 1,
              endIndex: 2,
            },
            properties: {
              pixelSize: 220,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: membersId,
              dimension: "COLUMNS",
              startIndex: 2,
              endIndex: 6,
            },
            properties: {
              pixelSize: 125,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: membersId,
              dimension: "COLUMNS",
              startIndex: 3,
              endIndex: 7,
            },
            properties: {
              pixelSize: 125,
            },
            fields: "pixelSize",
          },
        },

        {
          repeatCell: {
            range: {
              sheetId: membersId,
              startRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 7,
            },
            cell: {
              userEnteredFormat: {
                verticalAlignment: "MIDDLE",
                wrapStrategy: "CLIP",
              },
            },
            fields: "userEnteredFormat(verticalAlignment,wrapStrategy)",
          },
        },
      );
    }

    // TASKS
    if (tasksId !== undefined) {
      requests.push(
        {
          updateSheetProperties: {
            properties: {
              sheetId: tasksId,
              gridProperties: {
                frozenRowCount: 1,
              },
            },
            fields: "gridProperties.frozenRowCount",
          },
        },

        // Header
        {
          repeatCell: {
            range: {
              sheetId: tasksId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: {
                  red: 0.12,
                  green: 0.35,
                  blue: 0.7,
                },
                textFormat: {
                  bold: true,
                  foregroundColor: {
                    red: 1,
                    green: 1,
                    blue: 1,
                  },
                },
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat",
          },
        },

        // Task Name
        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 1,
            },
            properties: {
              pixelSize: 260,
            },
            fields: "pixelSize",
          },
        },

        // Assignee
        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 1,
              endIndex: 2,
            },
            properties: {
              pixelSize: 190,
            },
            fields: "pixelSize",
          },
        },

        // Email
        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 2,
              endIndex: 3,
            },
            properties: {
              pixelSize: 220,
            },
            fields: "pixelSize",
          },
        },

        // Status
        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 3,
              endIndex: 4,
            },
            properties: {
              pixelSize: 120,
            },
            fields: "pixelSize",
          },
        },

        // Due Date
        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 4,
              endIndex: 5,
            },
            properties: {
              pixelSize: 130,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 5,
              endIndex: 7,
            },
            properties: {
              pixelSize: 110,
            },
            fields: "pixelSize",
          },
        },

        {
          updateDimensionProperties: {
            range: {
              sheetId: tasksId,
              dimension: "COLUMNS",
              startIndex: 7,
              endIndex: 8,
            },
            properties: {
              pixelSize: 190,
            },
            fields: "pixelSize",
          },
        },

        {
          repeatCell: {
            range: {
              sheetId: tasksId,
              startRowIndex: 1,
              startColumnIndex: 0,
              endColumnIndex: 8,
            },
            cell: {
              userEnteredFormat: {
                verticalAlignment: "MIDDLE",
                wrapStrategy: "CLIP",
              },
            },
            fields: "userEnteredFormat(verticalAlignment,wrapStrategy)",
          },
        },
      );
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests,
        },
      });
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
