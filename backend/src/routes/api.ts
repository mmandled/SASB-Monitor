import { Router, type Request, type Response } from "express";
import { cacheService } from "../services/cacheService.js";
import {
  SASB_POSITION_GROUPS,
  SASB_POSITIONS,
  getPositionGroupLabel,
} from "../config/sasbPositions.js";

import {
  getMemberPositions,
  setMemberPosition,
} from "../services/positionService.js";

import {
  createRoleSessionToken,
  getRoleCookieName,
  getRoleCookieOptions,
  verifyRolePassword,
  verifyRoleSessionToken,
} from "../services/roleAuthService.js";

import { requireRoleAuth } from "../middleware/requireRoleAuth.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

apiRouter.get("/config/status", (_req: Request, res: Response) => {
  try {
    const status = cacheService.getConfigStatus();
    res.json(status);
  } catch (err: any) {
    console.error("[API /config/status Error]:", err.message);
    res.status(500).json({ error: "Failed to retrieve configuration status" });
  }
});

const handleSync = async (_req: Request, res: Response) => {
  try {
    const result = await cacheService.sync();
    res.json(result);
  } catch (err: any) {
    console.error("[API /sync Error]:", err.message);
    res.status(500).json({
      success: false,
      error:
        err.message ||
        "Unable to sync ClickUp data. Please check API token and workspace access.",
    });
  }
};

apiRouter.get("/sync", handleSync);
apiRouter.post("/sync", handleSync);

apiRouter.get("/dashboard", (req: Request, res: Response) => {
  try {
    const month =
      typeof req.query.month === "string" ? req.query.month : undefined;
    const memberId =
      typeof req.query.memberId === "string" ? req.query.memberId : undefined;
    const status =
      req.query.status === "completed" || req.query.status === "active"
        ? req.query.status
        : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const summary = cacheService.getDashboard({
      month,
      memberId,
      status,
      search,
    });

    res.json(summary);
  } catch (err: any) {
    console.error("[API /dashboard Error]:", err.message);
    res.status(500).json({ error: "Failed to retrieve dashboard data" });
  }
});

apiRouter.get("/members", async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const members = cacheService.getMembers(search);
    const savedPositions = await getMemberPositions();

    const positionMap = new Map(
      savedPositions.map((item) => [
        String(item.clickupUserId),
        item.position,
      ]),
    );

    const membersWithPositions = members.map((member) => {
      const position =
        positionMap.get(String(member.memberId)) ?? null;

      return {
        ...member,
        position,
        department: getPositionGroupLabel(position),
      };
    });

    res.json({
      members: membersWithPositions,
      count: membersWithPositions.length,
    });
  } catch (err: any) {
    console.error("[API /members Error]:", err.message);

    res.status(500).json({
      error: "Failed to retrieve members",
    });
  }
});

apiRouter.get("/departments", async (_req: Request, res: Response) => {
  try {
    const members = cacheService.getMembers();
    const savedPositions = await getMemberPositions();

    const positionMap = new Map(
      savedPositions.map((item) => [
        String(item.clickupUserId),
        item.position,
      ]),
    );

    const departmentMap = new Map<
      string,
      {
        department: string;
        memberCount: number;
        assigned: number;
        completed: number;
        active: number;
      }
    >();

    for (const member of members) {
      const position =
        positionMap.get(String(member.memberId)) ?? null;

      const department = getPositionGroupLabel(position);

      // Members without a position are not part of
      // department analytics yet.
      if (!department) continue;

      const existing = departmentMap.get(department) ?? {
        department,
        memberCount: 0,
        assigned: 0,
        completed: 0,
        active: 0,
      };

      existing.memberCount += 1;
      existing.assigned += member.assigned;
      existing.completed += member.completed;
      existing.active += member.active;

      departmentMap.set(department, existing);
    }

    const departments = Array.from(departmentMap.values())
      .map((department) => {
        const completionRate =
          department.assigned > 0
            ? Math.round(
                (department.completed / department.assigned) * 1000,
              ) / 10
            : 0;

        return {
          ...department,
          completionRate,
          completionRateFormatted:
            department.assigned > 0
              ? `${completionRate}%`
              : "N/A",
        };
      })
      .sort((a, b) =>
        a.department.localeCompare(b.department),
      );

    res.json({
      departments,
      count: departments.length,
    });
  } catch (err: any) {
    console.error("[API /departments Error]:", err.message);

    res.status(500).json({
      error: "Failed to retrieve department analytics",
    });
  }
});

apiRouter.get("/members/:memberId", (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    const member = cacheService.getMemberById(memberId);
    if (!member) {
      res.status(404).json({ error: "Member not found" });
      return;
    }
    res.json(member);
  } catch (err: any) {
    console.error("[API /members/:id Error]:", err.message);
    res.status(500).json({ error: "Failed to retrieve member details" });
  }
});

apiRouter.get("/tasks", (req: Request, res: Response) => {
  try {
    const month =
      typeof req.query.month === "string" ? req.query.month : undefined;
    const memberId =
      typeof req.query.memberId === "string" ? req.query.memberId : undefined;
    const status =
      req.query.status === "completed" || req.query.status === "active"
        ? req.query.status
        : undefined;
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const tasks = cacheService.getTasks({
      month,
      memberId,
      status,
      search,
    });

    res.json({ tasks, count: tasks.length });
  } catch (err: any) {
    console.error("[API /tasks Error]:", err.message);
    res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

apiRouter.get("/months", (_req: Request, res: Response) => {
  try {
    const months = cacheService.getMonths();
    res.json({ months });
  } catch (err: any) {
    console.error("[API /months Error]:", err.message);
    res.status(500).json({ error: "Failed to retrieve months" });
  }
});

apiRouter.post("/roles/auth/login", async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (typeof password !== "string" || !password) {
      res.status(400).json({
        error: "Password is required",
      });
      return;
    }

    const isValid = await verifyRolePassword(password);

    if (!isValid) {
      res.status(401).json({
        error: "Invalid password",
      });
      return;
    }

    const token = createRoleSessionToken();

    res.cookie(getRoleCookieName(), token, getRoleCookieOptions());

    res.json({
      success: true,
      authenticated: true,
    });
  } catch (err: any) {
    console.error("[API /roles/auth/login Error]:", err.message);

    res.status(500).json({
      error: "Unable to authenticate",
    });
  }
});

apiRouter.get("/roles/auth/status", (req: Request, res: Response) => {
  const token = req.cookies?.[getRoleCookieName()];

  const authenticated =
    typeof token === "string" && verifyRoleSessionToken(token);

  res.json({
    authenticated,
  });
});

apiRouter.post("/roles/auth/logout", (_req: Request, res: Response) => {
  res.clearCookie(getRoleCookieName(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.json({
    success: true,
    authenticated: false,
  });
});

apiRouter.get(
  "/roles/positions",
  requireRoleAuth,
  (_req: Request, res: Response) => {
    try {
      res.json({
        groups: SASB_POSITION_GROUPS,
        positions: SASB_POSITIONS,
      });
    } catch (err: any) {
      console.error("[API /roles/positions Error]:", err.message);

      res.status(500).json({
        error: "Failed to retrieve SASB positions",
      });
    }
  },
);

apiRouter.get(
  "/roles/members",
  requireRoleAuth,
  async (_req: Request, res: Response) => {
    try {
      const members = cacheService.getMembers();
      const savedPositions = await getMemberPositions();

      const positionMap = new Map(
        savedPositions.map((item) => [item.clickupUserId, item]),
      );

      const membersWithPositions = members.map((member) => {
        const saved = positionMap.get(String(member.memberId));

        return {
          id: String(member.memberId),
          name: member.memberName,
          email: member.email,
          position: saved?.position ?? null,
          positionUpdatedAt: saved?.updatedAt ?? null,
        };
      });

      res.json({
        members: membersWithPositions,
        count: membersWithPositions.length,
      });
    } catch (err: any) {
      console.error("[API /roles/members Error]:", err.message);
      res.status(500).json({
        error: "Failed to retrieve member positions",
      });
    }
  },
);

apiRouter.put(
  "/roles/members/:clickupUserId",
  requireRoleAuth,
  async (req: Request, res: Response) => {
    try {
      const { clickupUserId } = req.params;
      const { position } = req.body;

      if (!clickupUserId) {
        res.status(400).json({
          error: "ClickUp user ID is required",
        });
        return;
      }

      if (typeof position !== "string" || !position.trim()) {
        res.status(400).json({
          error: "Position is required",
        });
        return;
      }

      const member = cacheService.getMemberById(clickupUserId);

      if (!member) {
        res.status(404).json({
          error: "ClickUp member not found",
        });
        return;
      }

      const savedPosition = await setMemberPosition(clickupUserId, position);

      res.json({
        success: true,
        member: {
          id: String(member.memberId),
          name: member.memberName,
          email: member.email,
          position: savedPosition.position,
          positionUpdatedAt: savedPosition.updatedAt,
        },
      });
    } catch (err: any) {
      console.error(
        "[API PUT /roles/members/:clickupUserId Error]:",
        err.message,
      );

      if (err.message?.startsWith("Invalid SASB position:")) {
        res.status(400).json({
          error: err.message,
        });
        return;
      }

      res.status(500).json({
        error: "Failed to save member position",
      });
    }
  },
);
