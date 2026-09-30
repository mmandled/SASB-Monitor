export const SASB_POSITION_GROUPS = {
  executive: {
    label: "Executive Positions",
    positions: [
      "Editor-in-Chief",
      "Associate Editor-in-Chief for Internal",
      "Associate Editor-in-Chief for External",
      "Managing Editor",
      "Associate Managing Editor",
      "Finance Officer",
      "Staff Secretary",
    ],
  },

  illustration: {
    label: "Illustration",
    positions: [
      "Illustration Head",
      "Illustration Assistant Head",
      "Illustration Member",
    ],
  },

  graphics: {
    label: "Graphics",
    positions: ["Graphics Head", "Graphics Assistant Head", "Graphics Member"],
  },

  photo: {
    label: "Photo",
    positions: [
      "Photo Head",
      "Photo Assistant Head",
      "Photo Editor",
      "Photo Member",
    ],
  },

  video: {
    label: "Video",
    positions: ["Head Videographer", "Video Editor", "Videographer"],
  },

  content: {
    label: "Content",
    positions: ["Content Head", "Content Assistant Head", "Content Member"],
  },

  writer: {
    label: "Writer",
    positions: [
      "Writer Head",
      "Writer Assistant Head",
      "News Editor",
      "Feature Editor",
      "Literary Editor",
      "Writer Member",
    ],
  },

  onlineManager: {
    label: "Online Manager",
    positions: [
      "Online Managing Editor Head",
      "Assistant Head Online Managing Editor",
      "Online Manager Member",
    ],
  },

  editorial: {
    label: "Other Editorial Positions",
    positions: ["Creative Director", "Associate Creative Director"],
  },
} as const;

export type SasbPositionGroup = keyof typeof SASB_POSITION_GROUPS;

export type SasbPosition =
  (typeof SASB_POSITION_GROUPS)[SasbPositionGroup]["positions"][number];

export const SASB_POSITIONS = Object.values(SASB_POSITION_GROUPS).flatMap(
  (group) => group.positions,
) as SasbPosition[];

export function getPositionGroup(
  position: string | null | undefined,
): SasbPositionGroup | null {
  if (!position) return null;

  for (const [groupKey, group] of Object.entries(SASB_POSITION_GROUPS)) {
    if ((group.positions as readonly string[]).includes(position)) {
      return groupKey as SasbPositionGroup;
    }
  }

  return null;
}

export function getPositionGroupLabel(
  position: string | null | undefined,
): string | null {
  const group = getPositionGroup(position);

  if (!group) return null;

  return SASB_POSITION_GROUPS[group].label;
}

export function isValidSasbPosition(
  position: string,
): position is SasbPosition {
  return SASB_POSITIONS.includes(position as SasbPosition);
}