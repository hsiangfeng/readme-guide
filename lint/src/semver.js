// 只做到比對 Node.js 版本需要的版本範圍判斷：>=、>、<=、<、=、^、~、x、*、||、a - b。

/**
 * 解析版本字串（可以只有主版號）。
 * @param {string} text 例如 "22"、"v22.21.1"、"20.x"
 * @returns {{major:number, minor:number|null, patch:number|null}|null}
 */
export function parseVersion(text) {
  const m = String(text).trim().match(/^v?(\d+)(?:\.(\d+|x|\*))?(?:\.(\d+|x|\*))?/i);
  if (!m) return null;
  const num = (s) => (s === undefined || /^[x*]$/i.test(s) ? null : Number(s));
  return { major: Number(m[1]), minor: num(m[2]), patch: num(m[3]) };
}

function compare(a, b) {
  for (const key of ['major', 'minor', 'patch']) {
    const diff = (a[key] ?? 0) - (b[key] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function full(v) {
  return { major: v.major, minor: v.minor ?? 0, patch: v.patch ?? 0 };
}

/** 把一個比較式轉成 [下限, 下限含不含, 上限, 上限含不含] 的條件 */
function comparatorToTests(op, v) {
  const lower = full(v);
  const tests = [];
  const partialUpper = () => {
    if (v.minor === null) return { major: v.major + 1, minor: 0, patch: 0 };
    if (v.patch === null) return { major: v.major, minor: v.minor + 1, patch: 0 };
    return null;
  };
  switch (op) {
    case '>=':
      tests.push((x) => compare(x, lower) >= 0);
      break;
    case '>': {
      const up = partialUpper();
      tests.push(up ? (x) => compare(x, up) >= 0 : (x) => compare(x, lower) > 0);
      break;
    }
    case '<=': {
      const up = partialUpper();
      tests.push(up ? (x) => compare(x, up) < 0 : (x) => compare(x, lower) <= 0);
      break;
    }
    case '<':
      tests.push((x) => compare(x, lower) < 0);
      break;
    case '^': {
      let upper;
      if (v.major > 0 || v.minor === null) upper = { major: v.major + 1, minor: 0, patch: 0 };
      else if (v.minor > 0 || v.patch === null) upper = { major: 0, minor: v.minor + 1, patch: 0 };
      else upper = { major: 0, minor: 0, patch: (v.patch ?? 0) + 1 };
      tests.push((x) => compare(x, lower) >= 0 && compare(x, upper) < 0);
      break;
    }
    case '~': {
      const upper = v.minor === null ? { major: v.major + 1, minor: 0, patch: 0 } : { major: v.major, minor: v.minor + 1, patch: 0 };
      tests.push((x) => compare(x, lower) >= 0 && compare(x, upper) < 0);
      break;
    }
    default: {
      // 沒有符號：完整版本就是剛好等於；只有部分版本就是那一段
      const up = partialUpper();
      tests.push(up ? (x) => compare(x, lower) >= 0 && compare(x, up) < 0 : (x) => compare(x, lower) === 0);
    }
  }
  return tests;
}

/**
 * 解析版本範圍，傳回判斷函式；看不懂時傳回 null。
 * @param {string} range 例如 ">=22"、"^20 || ^22"、">=18 <23"、"22.x"
 */
export function parseRange(range) {
  const text = String(range).trim();
  if (text === '' || text === '*' || /^x$/i.test(text)) return () => true;
  const alternatives = text.split('||').map((s) => s.trim());
  const sets = [];
  for (const alt of alternatives) {
    const hyphen = alt.match(/^(\S+)\s+-\s+(\S+)$/);
    let comparators;
    if (hyphen) {
      comparators = [`>=${hyphen[1]}`, `<=${hyphen[2]}`];
    } else {
      comparators = alt.replace(/(>=|<=|>|<|=|\^|~)\s+/g, '$1').split(/\s+/).filter(Boolean);
    }
    const tests = [];
    for (const c of comparators) {
      const m = c.match(/^(>=|<=|>|<|=|\^|~)?(.+)$/);
      if (!m) return null;
      if (m[2] === '*' || /^x$/i.test(m[2])) continue;
      const v = parseVersion(m[2]);
      if (!v) return null;
      tests.push(...comparatorToTests(m[1] === '=' ? '' : (m[1] ?? ''), v));
    }
    sets.push(tests);
  }
  return (version) => sets.some((tests) => tests.every((t) => t(full(version))));
}
