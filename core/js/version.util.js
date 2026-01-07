function isSemVer(version) {
  return /^v?\d+\.\d+\.\d+(-[\w.]+)?$/.test(version);
}

function parseVersion(version) {
  version = version.replace(/^v/, '');
  const [core, pre] = version.split('-');
  const coreParts = core.split('.').map(Number);
  const preParts = pre ? pre.split('.').map(p => isNaN(p) ? p : Number(p)) : [];
  return { coreParts, preParts };
}

function compareVersions(a, b) {
  const va = parseVersion(a);
  const vb = parseVersion(b);

  const len = Math.max(va.coreParts.length, vb.coreParts.length);
  for (let i = 0; i < len; i++) {
    const ai = va.coreParts[i] || 0;
    const bi = vb.coreParts[i] || 0;
    if (ai !== bi) return ai - bi;
  }

  const prePriority = ['alpha', 'beta'];

  const isAPre = va.preParts.length > 0;
  const isBPre = vb.preParts.length > 0;

  if (!isAPre && isBPre) return 1;
  if (isAPre && !isBPre) return -1;

  for (let i = 0; i < Math.max(va.preParts.length, vb.preParts.length); i++) {
    const a = va.preParts[i];
    const b = vb.preParts[i];
    if (a === b) continue;

    if (typeof a === 'string' && typeof b === 'string') {
      const ai = prePriority.indexOf(a);
      const bi = prePriority.indexOf(b);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
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

  const currentParsed = parseVersion(current);
  const requiredParsed = parseVersion(required);

  const coreEqual =
    JSON.stringify(currentParsed.coreParts) === JSON.stringify(requiredParsed.coreParts);

  const requiredIsPre = requiredParsed.preParts.length > 0;

  // ✅ Sadece required pre değilse, core eşitliği yeterli
  if (coreEqual && !requiredIsPre) {
    return true;
  }

  return compareVersions(current, required) >= 0;
}
