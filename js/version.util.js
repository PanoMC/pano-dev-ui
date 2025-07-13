function isSemVer(version) {
  return /^v?\d+\.\d+\.\d+(-[\w.]+)?$/.test(version);
}

function parseVersion(version) {
  version = version.replace(/^v/, ''); // Remove leading 'v'
  const [core, pre] = version.split('-');
  const coreParts = core.split('.').map(Number);
  const preParts = pre ? pre.split('.').map(p => isNaN(p) ? p : Number(p)) : [];
  return { coreParts, preParts };
}

function compareVersions(tags, a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  const len = Math.max(va.coreParts.length, vb.coreParts.length);
  for (let i = 0; i < len; i++) {
    const ai = va.coreParts[i] || 0;
    const bi = vb.coreParts[i] || 0;
    if (ai !== bi) return ai - bi;
  }

  const prePriority = tags;

  if (va.preParts.length === 0 && vb.preParts.length > 0) return 1;
  if (vb.preParts.length === 0 && va.preParts.length > 0) return -1;

  for (let i = 0; i < Math.max(va.preParts.length, vb.preParts.length); i++) {
    const a = va.preParts[i];
    const b = vb.preParts[i];
    if (a === b) continue;

    if (typeof a === 'string' && typeof b === 'string') {
      return (prePriority.indexOf(a) || 99) - (prePriority.indexOf(b) || 99);
    } else if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    } else {
      return typeof a === 'string' ? -1 : 1;
    }
  }

  return 0;
}

export function isPanoVersionCompatible(current, required) {
  if (current === "local-build") return true;
  if (!isSemVer(current) || !isSemVer(required)) return false;
  return compareVersions(['alpha', 'beta'], current, required) >= 0;
}