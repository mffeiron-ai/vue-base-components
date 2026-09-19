/**
 * 迷你 2D 刚体物理（矩形 + 旋转 + 静止墙 + 鼠标弹簧）
 *
 * 说明：上游 Falling Text 依赖 `matter-js`。本组件库的动效一律**不引第三方依赖**，
 * 所以这里只实现 matter-js 里这个效果真正用得上的那一小部分，
 * **常量与 matter-js 对齐**，让 `gravity` / `mouseConstraintStiffness` 这些参数的手感一致：
 *
 *  · 固定步长 60Hz（matter 的默认 `Engine.update(engine)` 就是 16.666ms）
 *  · gravity：matter 的 `engine.gravity.scale = 0.001`，每步速度增量 = `gravity × 0.001 × dt²`
 *  · frictionAir 0.01 / restitution 0.8 / friction 0.2（上游给词块的就是这三个值）
 *  · 质量 = `w × h × 0.001`、矩形转动惯量 = `m × (w² + h²) / 12`（同 matter 的默认 density 与公式）
 *
 * 碰撞用「SAT 求最小分离轴 + 顶点穿透取接触点 + 冲量解算」：
 * 平放在地上时两个下角各算一个接触点，所以不会歪倒；四角都进墙时会有多个接触点。
 */

/** 固定步长（毫秒）—— 与 matter-js 的默认引擎步长一致 */
export const STEP = 1000 / 60

/** matter-js 的重力标度：`gravity.y × scale × dt²`（scale = 0.001） */
export const GRAVITY_SCALE = 0.001 * STEP * STEP

/** 低于这个接近速度就不做反弹（否则落定后会一直微抖） */
const RESTITUTION_THRESHOLD = 1.5
/** 速度上限，防止极端情况下炸掉 */
const MAX_VELOCITY = 60
const MAX_ANGULAR_VELOCITY = 0.8
/** 求解迭代次数（对齐 matter-js 的默认值：速度 2 轮、位置 6 轮） */
const VELOCITY_ITERATIONS = 2
const POSITION_ITERATIONS = 6
/** 位置求解：每轮修正剩余穿透的比例，以及允许的残留（slop） */
const POSITION_CORRECTION = 0.35
const POSITION_SLOP = 0.3

export interface RectBody {
  /** 质心位置 */
  x: number
  y: number
  vx: number
  vy: number
  /** 弧度 */
  angle: number
  /** 角速度（弧度/步） */
  av: number
  halfW: number
  halfH: number
  mass: number
  invMass: number
  inertia: number
  invInertia: number
  restitution: number
  friction: number
  frictionAir: number
  isStatic: boolean
}

export interface RectOptions {
  vx?: number
  vy?: number
  angle?: number
  av?: number
  restitution?: number
  friction?: number
  frictionAir?: number
  density?: number
  isStatic?: boolean
}

export function createRect(x: number, y: number, w: number, h: number, options: RectOptions = {}): RectBody {
  const isStatic = options.isStatic ?? false
  const density = options.density ?? 0.001
  const mass = isStatic ? Infinity : Math.max(w * h * density, 1e-6)
  const inertia = isStatic ? Infinity : (mass * (w * w + h * h)) / 12

  return {
    x,
    y,
    vx: options.vx ?? 0,
    vy: options.vy ?? 0,
    angle: options.angle ?? 0,
    av: options.av ?? 0,
    halfW: w / 2,
    halfH: h / 2,
    mass,
    invMass: isStatic ? 0 : 1 / mass,
    inertia,
    invInertia: isStatic ? 0 : 1 / inertia,
    restitution: options.restitution ?? 0.8,
    friction: options.friction ?? 0.2,
    frictionAir: options.frictionAir ?? 0.01,
    isStatic,
  }
}

/* ── 几何 ─────────────────────────────────────────────── */

/** 矩形的两个局部轴（单位向量）在世界坐标下的方向 */
function axesOf(b: RectBody): [number, number][] {
  const c = Math.cos(b.angle)
  const s = Math.sin(b.angle)
  return [
    [c, s],
    [-s, c],
  ]
}

function project(b: RectBody, axis: [number, number]) {
  const c = Math.cos(b.angle)
  const s = Math.sin(b.angle)
  const center = b.x * axis[0] + b.y * axis[1]
  // 半宽沿 axis 的分量 + 半高沿 axis 的分量
  const extent =
    Math.abs((axis[0] * c + axis[1] * s) * b.halfW) + Math.abs((axis[0] * -s + axis[1] * c) * b.halfH)
  return { min: center - extent, max: center + extent }
}

/** 矩形的四个顶点 */
export function verticesOf(b: RectBody): [number, number][] {
  const c = Math.cos(b.angle)
  const s = Math.sin(b.angle)
  const ax = c * b.halfW
  const ay = s * b.halfW
  const bx = -s * b.halfH
  const by = c * b.halfH
  return [
    [b.x + ax + bx, b.y + ay + by],
    [b.x + ax - bx, b.y + ay - by],
    [b.x - ax - bx, b.y - ay - by],
    [b.x - ax + bx, b.y - ay + by],
  ]
}

/** 点是否在矩形内（含旋转） */
export function pointInBody(b: RectBody, x: number, y: number, margin = 0): boolean {
  const c = Math.cos(b.angle)
  const s = Math.sin(b.angle)
  const dx = x - b.x
  const dy = y - b.y
  const lx = dx * c + dy * s
  const ly = -dx * s + dy * c
  return Math.abs(lx) <= b.halfW + margin && Math.abs(ly) <= b.halfH + margin
}

/**
 * SAT：求两个矩形的**最小分离轴**。
 * 返回的法线方向统一为「从 A 指向 B」，depth 是穿透深度；不相交返回 null。
 */
function sat(A: RectBody, B: RectBody) {
  const axes = [...axesOf(A), ...axesOf(B)]
  let bestNormal: [number, number] | null = null
  let bestDepth = Infinity

  for (const axis of axes) {
    const a = project(A, axis)
    const b = project(B, axis)
    const overlap = Math.min(a.max, b.max) - Math.max(a.min, b.min)
    if (overlap <= 0) return null
    if (overlap < bestDepth) {
      bestDepth = overlap
      bestNormal = axis
    }
  }

  if (!bestNormal) return null
  let normal: [number, number] = [bestNormal[0], bestNormal[1]]
  if ((B.x - A.x) * normal[0] + (B.y - A.y) * normal[1] < 0) normal = [-normal[0], -normal[1]]
  return { normal, depth: bestDepth }
}

/** 在某个方向上的支撑点（最远顶点） */
function support(b: RectBody, dir: [number, number]): [number, number] {
  const verts = verticesOf(b)
  let best = verts[0]
  let bestDot = -Infinity
  for (const v of verts) {
    const d = v[0] * dir[0] + v[1] * dir[1]
    if (d > bestDot) {
      bestDot = d
      best = v
    }
  }
  return best
}

/** 接触点：把落在对方内部的顶点都算上（平放时自然是两个角） */
function contactPoints(A: RectBody, B: RectBody, normal: [number, number]): [number, number][] {
  const points: [number, number][] = []
  for (const v of verticesOf(A)) if (pointInBody(B, v[0], v[1], 0.01)) points.push(v)
  for (const v of verticesOf(B)) if (pointInBody(A, v[0], v[1], 0.01)) points.push(v)
  if (points.length) return points
  // 兜底：两侧支撑点的中点
  const pa = support(A, normal)
  const pb = support(B, [-normal[0], -normal[1]])
  return [[(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]]
}

/* ── 冲量 ─────────────────────────────────────────────── */

/** 在接触点 r 处沿 dir 施加冲量 j（dir 为单位向量） */
function applyImpulse(b: RectBody, j: number, dir: [number, number], rx: number, ry: number) {
  if (b.invMass === 0) return
  b.vx += j * dir[0] * b.invMass
  b.vy += j * dir[1] * b.invMass
  b.av += (rx * (j * dir[1]) - ry * (j * dir[0])) * b.invInertia
}

/* ── 接触与求解 ───────────────────────────────────────── */

/** 一对接触（一步里只探测一次，之后的所有迭代都复用） */
interface Contact {
  a: RectBody
  b: RectBody
  /** 单位法线，方向从 a 指向 b */
  normal: [number, number]
  points: [number, number][]
  restitution: number
  friction: number
}

/** 粗筛：包围圆不相交就不用做 SAT 了 */
function broadPhase(a: RectBody, b: RectBody) {
  const reach = Math.hypot(a.halfW, a.halfH) + Math.hypot(b.halfW, b.halfH)
  return Math.hypot(b.x - a.x, b.y - a.y) <= reach
}

function collectContacts(bodies: RectBody[]): Contact[] {
  const contacts: Contact[] = []
  for (let i = 0; i < bodies.length; i += 1) {
    for (let j = i + 1; j < bodies.length; j += 1) {
      const a = bodies[i]
      const b = bodies[j]
      if (a.isStatic && b.isStatic) continue
      if (!broadPhase(a, b)) continue
      const hit = sat(a, b)
      if (!hit) continue
      contacts.push({
        a,
        b,
        normal: hit.normal,
        points: contactPoints(a, b, hit.normal),
        restitution: Math.max(a.restitution, b.restitution),
        friction: Math.min(a.friction, b.friction),
      })
    }
  }
  return contacts
}

/** 速度求解：按接触点加法向冲量（含反弹）与切向冲量（库仑摩擦） */
function solveVelocity(c: Contact) {
  const { a: A, b: B, normal, points, restitution, friction } = c

  for (const p of points) {
    const rAx = p[0] - A.x
    const rAy = p[1] - A.y
    const rBx = p[0] - B.x
    const rBy = p[1] - B.y

    // 接触点处 B 相对 A 的速度（含旋转：ω × r = (-ω·ry, ω·rx)）
    const vAx = A.vx - A.av * rAy
    const vAy = A.vy + A.av * rAx
    const vBx = B.vx - B.av * rBy
    const vBy = B.vy + B.av * rBx
    const rvx = vBx - vAx
    const rvy = vBy - vAy

    const vn = rvx * normal[0] + rvy * normal[1]
    if (vn > 0) continue // 已经在分离

    const rnA = rAx * normal[1] - rAy * normal[0]
    const rnB = rBx * normal[1] - rBy * normal[0]
    const invSum = A.invMass + B.invMass + rnA * rnA * A.invInertia + rnB * rnB * B.invInertia
    if (invSum === 0) continue

    const e = vn < -RESTITUTION_THRESHOLD ? restitution : 0
    const j = (-(1 + e) * vn) / invSum
    applyImpulse(A, -j, normal, rAx, rAy)
    applyImpulse(B, j, normal, rBx, rBy)

    // 库仑摩擦（切向冲量按 μ·|j| 截断）
    const tangent: [number, number] = [-normal[1], normal[0]]
    const vt = rvx * tangent[0] + rvy * tangent[1]
    const rtA = rAx * tangent[1] - rAy * tangent[0]
    const rtB = rBx * tangent[1] - rBy * tangent[0]
    const invSumT = A.invMass + B.invMass + rtA * rtA * A.invInertia + rtB * rtB * B.invInertia
    if (invSumT > 0) {
      const maxFriction = friction * Math.abs(j)
      const jt = Math.max(-maxFriction, Math.min(maxFriction, -vt / invSumT))
      applyImpulse(A, -jt, tangent, rAx, rAy)
      applyImpulse(B, jt, tangent, rBx, rBy)
    }
  }
}

/** 位置求解：按质量加权把两者沿法线推开（每轮都重算当前深度，越推越少） */
function solvePosition(c: Contact) {
  const { a: A, b: B, normal } = c
  const invSum = A.invMass + B.invMass
  if (invSum === 0) return
  const pa = project(A, normal)
  const pb = project(B, normal)
  const depth = Math.min(pa.max, pb.max) - Math.max(pa.min, pb.min)
  if (depth <= POSITION_SLOP) return
  const correction = ((depth - POSITION_SLOP) * POSITION_CORRECTION) / invSum
  A.x -= correction * A.invMass * normal[0]
  A.y -= correction * A.invMass * normal[1]
  B.x += correction * B.invMass * normal[0]
  B.y += correction * B.invMass * normal[1]
}

/* ── 步进 ─────────────────────────────────────────────── */

function clampBody(b: RectBody) {
  const speed = Math.hypot(b.vx, b.vy)
  if (speed > MAX_VELOCITY) {
    b.vx = (b.vx / speed) * MAX_VELOCITY
    b.vy = (b.vy / speed) * MAX_VELOCITY
  }
  if (Math.abs(b.av) > MAX_ANGULAR_VELOCITY) {
    b.av = Math.sign(b.av) * MAX_ANGULAR_VELOCITY
  }
  if (!Number.isFinite(b.x) || !Number.isFinite(b.y) || !Number.isFinite(b.angle)) {
    b.x = 0
    b.y = 0
    b.angle = 0
    b.vx = 0
    b.vy = 0
    b.av = 0
  }
}

/**
 * 推进一个固定步长：积分 → 收集接触 → 多轮速度求解 → 多轮位置求解。
 *
 * 迭代次数对齐 matter-js 的做法（`velocityIterations` / `positionIterations`）：
 * 一次冲量 + 一次位置修正对**堆叠**的词根本推不开（实测会互相嵌 10px），
 * 拆成多轮 Gauss-Seidel 迭代后，落定时的穿透降到 1px 以内。
 *
 * 注意这里**不加任何内部阻尼**（除了每个刚体自己的 `frictionAir`），
 * 所以落下 → 弹几下 → 稳住的节奏与 matter-js 基本一致。
 */
export function stepWorld(bodies: RectBody[], gravity: number) {
  const accel = gravity * GRAVITY_SCALE

  for (const b of bodies) {
    if (b.isStatic) continue
    const damp = 1 - b.frictionAir
    b.vx *= damp
    b.vy *= damp
    b.av *= damp
    b.vy += accel
    b.x += b.vx
    b.y += b.vy
    b.angle += b.av
  }

  const contacts = collectContacts(bodies)

  for (let iteration = 0; iteration < VELOCITY_ITERATIONS; iteration += 1) {
    for (const contact of contacts) solveVelocity(contact)
  }

  for (let iteration = 0; iteration < POSITION_ITERATIONS; iteration += 1) {
    for (const contact of contacts) solvePosition(contact)
  }

  for (const b of bodies) if (!b.isStatic) clampBody(b)
}

/**
 * 鼠标弹簧（等价 matter 的 MouseConstraint）：
 * 抓住时记录抓点在刚体**局部坐标**里的位置；每步把「抓点的世界位置」拽向指针。
 * matter 的约束是「按质量加权直接挪位置」，这里换成等价的**速度伺服** ——
 * 既跟手，又保留惯性（松手会甩出去），而且不会穿墙（速度有限）。
 */
export function applyMouseSpring(
  body: RectBody,
  localX: number,
  localY: number,
  targetX: number,
  targetY: number,
  stiffness: number,
) {
  const c = Math.cos(body.angle)
  const s = Math.sin(body.angle)
  const wx = body.x + localX * c - localY * s
  const wy = body.y + localX * s + localY * c

  const dx = targetX - wx
  const dy = targetY - wy

  const k = Math.max(0.02, Math.min(stiffness, 1.5)) * 0.35
  const damping = 0.82

  const fx = dx * k
  const fy = dy * k
  body.vx = (body.vx + fx) * damping
  body.vy = (body.vy + fy) * damping

  // 抓点偏心 → 产生扭矩，词块会像被拎着一角一样甩起来
  const rx = wx - body.x
  const ry = wy - body.y
  const torque = rx * fy - ry * fx
  const size = (body.halfW * 2) ** 2 + (body.halfH * 2) ** 2
  if (size > 0) {
    const angular = (torque * 12) / size
    body.av = (body.av + angular * 0.5) * damping
  }
  if (Math.abs(body.av) > 0.35) body.av = Math.sign(body.av) * 0.35
}

/** 把抓点从世界坐标转成刚体局部坐标 */
export function toLocal(body: RectBody, x: number, y: number): [number, number] {
  const c = Math.cos(body.angle)
  const s = Math.sin(body.angle)
  const dx = x - body.x
  const dy = y - body.y
  return [dx * c + dy * s, -dx * s + dy * c]
}
