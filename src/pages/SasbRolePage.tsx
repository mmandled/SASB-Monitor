// src\pages\SasbRolePage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  LogIn,
  LogOut,
  Save,
  Search,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

import {
  fetchRoleAuthStatus,
  fetchRoleMembers,
  fetchRolePositions,
  loginRoleAdmin,
  logoutRoleAdmin,
  saveMemberPosition,
  type SasbRoleMember,
  type SasbPositionCatalog,
} from "../lib/api.js";

export const SasbRolePage: React.FC = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [members, setMembers] = useState<SasbRoleMember[]>([]);
  const [catalog, setCatalog] = useState<SasbPositionCatalog | null>(null);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [search, setSearch] = useState("");

  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRoleData = async () => {
    setIsLoadingData(true);
    setError("");

    try {
      const [memberData, positionData] = await Promise.all([
        fetchRoleMembers(),
        fetchRolePositions(),
      ]);

      setMembers(memberData);
      setCatalog(positionData);
    } catch (err: any) {
      setError(err.message || "Failed to load position management data");
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuthenticated = await fetchRoleAuthStatus();
        setAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          await loadRoleData();
        }
      } catch {
        setAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const selectedMember = members.find(
    (member) => member.id === selectedMemberId,
  );

  useEffect(() => {
    setSelectedPosition(selectedMember?.position ?? "");
    setMessage("");
    setError("");
  }, [selectedMemberId]);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return members;

    return members.filter((member) => {
      return (
        member.name.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query) ||
        member.position?.toLowerCase().includes(query)
      );
    });
  }, [members, search]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!password) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      await loginRoleAdmin(password);

      const isAuthenticated = await fetchRoleAuthStatus();

      if (!isAuthenticated) {
        throw new Error(
          "Login succeeded, but the session could not be established.",
        );
      }

      setAuthenticated(true);
      setPassword("");

      await loadRoleData();
    } catch (err: any) {
      console.error("[SASB Role Login Error]:", err);

      setAuthenticated(false);
      setLoginError(err.message || "Unable to sign in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutRoleAdmin();
    } finally {
      setAuthenticated(false);
      setMembers([]);
      setCatalog(null);
      setSelectedMemberId("");
      setSelectedPosition("");
      setSearch("");
      setMessage("");
      setError("");
    }
  };

  const handleSave = async () => {
    if (!selectedMemberId || !selectedPosition) return;

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const updatedMember = await saveMemberPosition(
        selectedMemberId,
        selectedPosition,
      );

      setMembers((current) =>
        current.map((member) =>
          member.id === updatedMember.id ? updatedMember : member,
        ),
      );

      setMessage(
        `${updatedMember.name} is now assigned as ${updatedMember.position}.`,
      );
    } catch (err: any) {
      setError(err.message || "Failed to save position");
    } finally {
      setIsSaving(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-6">
        <p className="text-sm text-slate-500 dark:text-neutral-400">
          Checking access...
        </p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-6">
            <ShieldCheck size={24} />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            SASB Position Management
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-neutral-400">
            Authorized SAS Bulletin access only.
          </p>

          <form onSubmit={handleLogin} className="mt-7 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter management password"
                autoFocus
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !password}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <LogIn size={17} />
              {isLoggingIn ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-neutral-100">
      <div className="max-w-5xl mx-auto p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <UserRoundCog size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">
                SAS Bulletin
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold">
              Position Management
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
              Assign one official SASB position to each ClickUp member.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-neutral-700 px-3.5 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-neutral-800"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-sm">
          <div className="relative mb-5">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search members..."
              className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 pl-10 pr-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold mb-2">Member</label>

              <select
                value={selectedMemberId}
                onChange={(event) => setSelectedMemberId(event.target.value)}
                disabled={isLoadingData}
                className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5"
              >
                <option value="">
                  {isLoadingData ? "Loading members..." : "Select member"}
                </option>

                {filteredMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                    {member.position ? ` — ${member.position}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Position
              </label>

              <select
                value={selectedPosition}
                onChange={(event) => setSelectedPosition(event.target.value)}
                disabled={!selectedMemberId || !catalog}
                className="w-full rounded-lg border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2.5"
              >
                <option value="">Select position</option>

                {catalog &&
                  Object.entries(catalog.groups).map(([key, group]) => (
                    <optgroup key={key} label={group.label}>
                      {group.positions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </div>
          </div>

          {selectedMember && (
            <div className="mt-5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 p-4">
              <p className="font-semibold">{selectedMember.name}</p>

              <p className="text-sm text-slate-500 dark:text-neutral-400">
                {selectedMember.email || "No email available"}
              </p>

              <p className="mt-2 text-sm">
                Current position:{" "}
                <span className="font-semibold">
                  {selectedMember.position || "Not assigned"}
                </span>
              </p>
            </div>
          )}

          {message && (
            <p className="mt-5 text-sm text-green-600 dark:text-green-400">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-5 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={
                !selectedMemberId ||
                !selectedPosition ||
                isSaving ||
                selectedPosition === selectedMember?.position
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Position"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
