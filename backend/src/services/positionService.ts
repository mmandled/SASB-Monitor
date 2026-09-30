import { createClient } from "@supabase/supabase-js";
import {
  isValidSasbPosition,
  type SasbPosition,
} from "../config/sasbPositions.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

const supabase =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      })
    : null;

export interface MemberPosition {
  clickupUserId: string;
  position: SasbPosition;
  updatedAt: string;
}

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check SUPABASE_URL and SUPABASE_SECRET_KEY.",
    );
  }

  return supabase;
}

export async function getMemberPositions(): Promise<MemberPosition[]> {
  const client = requireSupabase();

  const { data, error } = await client
    .from("member_positions")
    .select("clickup_user_id, position, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load member positions: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => isValidSasbPosition(row.position))
    .map((row) => ({
      clickupUserId: row.clickup_user_id,
      position: row.position as SasbPosition,
      updatedAt: row.updated_at,
    }));
}

export async function getMemberPosition(
  clickupUserId: string,
): Promise<MemberPosition | null> {
  const client = requireSupabase();

  const { data, error } = await client
    .from("member_positions")
    .select("clickup_user_id, position, updated_at")
    .eq("clickup_user_id", clickupUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load member position: ${error.message}`);
  }

  if (!data) return null;

  if (!isValidSasbPosition(data.position)) {
    return null;
  }

  return {
    clickupUserId: data.clickup_user_id,
    position: data.position,
    updatedAt: data.updated_at,
  };
}

export async function setMemberPosition(
  clickupUserId: string,
  position: string,
): Promise<MemberPosition> {
  const client = requireSupabase();

  if (!isValidSasbPosition(position)) {
    throw new Error(`Invalid SASB position: ${position}`);
  }

  const { data, error } = await client
    .from("member_positions")
    .upsert(
      {
        clickup_user_id: clickupUserId,
        position,
      },
      {
        onConflict: "clickup_user_id",
      },
    )
    .select("clickup_user_id, position, updated_at")
    .single();

  if (error) {
    throw new Error(`Failed to save member position: ${error.message}`);
  }

  return {
    clickupUserId: data.clickup_user_id,
    position: data.position as SasbPosition,
    updatedAt: data.updated_at,
  };
}