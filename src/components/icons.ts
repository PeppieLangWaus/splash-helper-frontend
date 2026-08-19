type IconLeaf = string;
type IconTree = {
  [key: string]: IconLeaf | IconTree;
};

type SpellIcons = Readonly<Record<string, string>>;

const ICON_FILE_PATHS = [
  '/assets/icons/magic.png',
  '/assets/icons/panelBackground.png',
  '/assets/icons/start.png',
  '/assets/icons/thieving.png',
  '/assets/icons/update.png',
  '/assets/icons/world.png',
  '/assets/icons/xp.png',
  '/assets/icons/knight/normal.png',
  '/assets/icons/knight/sticky.png',
  '/assets/icons/location/aus.png',
  '/assets/icons/location/bra.png',
  '/assets/icons/location/ger.png',
  '/assets/icons/location/jap.png',
  '/assets/icons/location/sa.png',
  '/assets/icons/location/sin.png',
  '/assets/icons/location/uk.png',
  '/assets/icons/location/useast.png',
  '/assets/icons/location/uswest.png',
  '/assets/icons/spells/blast/earth.png',
  '/assets/icons/spells/blast/fire.png',
  '/assets/icons/spells/blast/water.png',
  '/assets/icons/spells/blast/wind.png',
  '/assets/icons/spells/bolt/earth.png',
  '/assets/icons/spells/bolt/fire.png',
  '/assets/icons/spells/bolt/water.png',
  '/assets/icons/spells/bolt/wind.png',
  '/assets/icons/spells/strike/earth.png',
  '/assets/icons/spells/strike/fire.png',
  '/assets/icons/spells/strike/water.png',
  '/assets/icons/spells/strike/wind.png',
  '/assets/icons/worldType/deadman.png',
  '/assets/icons/worldType/f2p.png',
  '/assets/icons/worldType/members.png',
  '/assets/icons/worldType/pvp.png',
  '/assets/icons/components/buttons/like/selected.png',
  '/assets/icons/components/buttons/like/unselected.png',
  '/assets/icons/components/buttons/dislike/selected.png',
  '/assets/icons/components/buttons/dislike/unselected.png',
] as const;

function stripAssetPrefixAndExtension(assetPath: string): string[] {
  return assetPath
    .replace(/^\/assets\/icons\//, '')
    .replace(/\.[^/.]+$/, '')
    .split('/');
}

function insertIcon(tree: IconTree, keyParts: string[], value: string): void {
  let current: IconTree = tree;

  for (let i = 0; i < keyParts.length; i += 1) {
    const part = keyParts[i];
    const isLeaf = i === keyParts.length - 1;

    if (isLeaf) {
      current[part] = value;
      return;
    }

    const next = current[part];
    if (typeof next === 'string' || next === undefined) {
      current[part] = {};
    }

    current = current[part] as IconTree;
  }
}

function buildIcons(paths: readonly string[]): Readonly<IconTree> {
  const tree: IconTree = {};

  for (const iconPath of paths) {
    const keyParts = stripAssetPrefixAndExtension(iconPath);
    insertIcon(tree, keyParts, iconPath);
  }

  return tree;
}

function buildSpellIcons(paths: readonly string[]): SpellIcons {
  const map: Record<string, string> = {};

  for (const iconPath of paths) {
    const match = iconPath.match(/^\/assets\/icons\/spells\/([^/]+)\/([^/.]+)\.[^/.]+$/);
    if (!match) {
      continue;
    }

    const [, spellTier, element] = match;
    const spellKey = `${element}_${spellTier}`.toUpperCase();
    map[spellKey] = iconPath;
  }

  return map;
}

export const icons = buildIcons(ICON_FILE_PATHS);
export const spellIcons = buildSpellIcons(ICON_FILE_PATHS);

export function getSpellIcon(spellName: string): string | undefined {
  return spellIcons[spellName.toUpperCase()];
}

export function getIcon(path: string): string | undefined {
  const directSpell = getSpellIcon(path);
  if (directSpell) {
    return directSpell;
  }

  const keyParts = path.split('.').filter(Boolean);
  let current: IconLeaf | IconTree = icons;

  for (const part of keyParts) {
    if (typeof current === 'string') {
      return undefined;
    }

    current = current[part];
    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}
