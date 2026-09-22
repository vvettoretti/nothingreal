// Parser di espressioni complesse: "(z^2-1)/(z-i)", "e^(1/z)", "2z sin z", ...
import * as K from './complex'
import type { Complex, Fn } from './complex'

type Node =
  | { k: 'num'; v: Complex }
  | { k: 'z' }
  | { k: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: Node; b: Node }
  | { k: 'neg'; a: Node }
  | { k: 'call'; f: string; a: Node }

const FUNCS: Record<string, (z: Complex) => Complex> = {
  sin: K.sin,
  cos: K.cos,
  tan: K.tan,
  sinh: K.sinh,
  cosh: K.cosh,
  tanh: K.tanh,
  exp: K.exp,
  log: K.log,
  ln: K.log,
  sqrt: K.sqrt,
  conj: K.conj,
  re: (z) => [z[0], 0],
  im: (z) => [z[1], 0],
  abs: (z) => [K.abs(z), 0],
  arg: (z) => [K.arg(z), 0],
}
const CONSTS: Record<string, Complex> = { i: K.I, e: [Math.E, 0], pi: [Math.PI, 0] }
const NAMES = [...Object.keys(FUNCS), ...Object.keys(CONSTS), 'z'].sort((a, b) => b.length - a.length)

type Tok = { t: 'num'; v: number } | { t: 'id'; v: string } | { t: 'op'; v: string }

function tokenize(src: string): Tok[] {
  const s = src
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/√/g, 'sqrt')
    .replace(/π/g, 'pi')
    .replace(/[·×]/g, '*')
    .replace(/−/g, '-')
    .replace(/z̄/g, 'conj(z)')
  const out: Tok[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    const num = /^(\d+\.?\d*|\.\d+)/.exec(s.slice(i))
    if (num) {
      out.push({ t: 'num', v: parseFloat(num[1]) })
      i += num[1].length
      continue
    }
    const word = /^[a-zA-Z]+/.exec(s.slice(i))
    if (word) {
      // spezza parole come "zexp" o "iz" nei nomi noti più lunghi possibili
      let w = word[0].toLowerCase()
      while (w.length) {
        const name = NAMES.find((n) => w.startsWith(n))
        if (!name) throw new Error(`simbolo sconosciuto "${w}"`)
        out.push({ t: 'id', v: name })
        w = w.slice(name.length)
      }
      i += word[0].length
      continue
    }
    if ('+-*/^()'.includes(ch)) {
      out.push({ t: 'op', v: ch })
      i++
      continue
    }
    throw new Error(`carattere inatteso "${ch}"`)
  }
  return out
}

function parse(src: string): Node {
  const toks = tokenize(src)
  let p = 0
  const peek = () => toks[p]
  const isOp = (v: string) => peek()?.t === 'op' && peek()!.v === v
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`atteso "${v}"`)
    p++
  }

  const expr = (): Node => {
    let a = term()
    while (isOp('+') || isOp('-')) {
      const op = toks[p++].v as '+' | '-'
      a = { k: 'bin', op, a, b: term() }
    }
    return a
  }
  const startsAtom = () => {
    const t = peek()
    return !!t && (t.t === 'num' || t.t === 'id' || (t.t === 'op' && t.v === '('))
  }
  const term = (): Node => {
    let a = unary()
    for (;;) {
      if (isOp('*') || isOp('/')) {
        const op = toks[p++].v as '*' | '/'
        a = { k: 'bin', op, a, b: unary() }
      } else if (startsAtom()) {
        a = { k: 'bin', op: '*', a, b: power() } // moltiplicazione implicita
      } else return a
    }
  }
  const unary = (): Node => {
    if (isOp('-')) {
      p++
      return { k: 'neg', a: unary() }
    }
    if (isOp('+')) {
      p++
      return unary()
    }
    return power()
  }
  const power = (): Node => {
    const a = atom()
    if (isOp('^')) {
      p++
      return { k: 'bin', op: '^', a, b: unary() }
    }
    return a
  }
  const atom = (): Node => {
    const t = peek()
    if (!t) throw new Error('espressione incompleta')
    if (t.t === 'num') {
      p++
      return { k: 'num', v: [t.v, 0] }
    }
    if (t.t === 'id') {
      p++
      if (t.v === 'z') return { k: 'z' }
      if (t.v in CONSTS) return { k: 'num', v: CONSTS[t.v] }
      // funzione: argomento tra parentesi oppure un fattore ("sin z")
      if (isOp('(')) {
        p++
        const a = expr()
        expect(')')
        return { k: 'call', f: t.v, a }
      }
      return { k: 'call', f: t.v, a: power() }
    }
    if (t.v === '(') {
      p++
      const a = expr()
      expect(')')
      return a
    }
    throw new Error(`"${t.v}" fuori posto`)
  }

  const n = expr()
  if (p < toks.length) throw new Error(`"${String(toks[p].v)}" fuori posto`)
  return n
}

function constant(n: Node): Complex | null {
  switch (n.k) {
    case 'num':
      return n.v
    case 'z':
      return null
    case 'neg': {
      const a = constant(n.a)
      return a && K.neg(a)
    }
    case 'call': {
      const a = constant(n.a)
      return a && FUNCS[n.f](a)
    }
    case 'bin': {
      const a = constant(n.a)
      const b = constant(n.b)
      if (!a || !b) return null
      return BIN[n.op](a, b)
    }
  }
}

const BIN = {
  '+': K.add,
  '-': K.sub,
  '*': K.mul,
  '/': K.div,
  '^': K.pow,
}

function build(n: Node): Fn {
  const c = constant(n)
  if (c) return () => c
  switch (n.k) {
    case 'z':
      return (z) => z
    case 'neg': {
      const a = build(n.a)
      return (z) => K.neg(a(z))
    }
    case 'call': {
      const a = build(n.a)
      const f = FUNCS[n.f]
      return (z) => f(a(z))
    }
    case 'bin': {
      const a = build(n.a)
      if (n.op === '^') {
        const e = constant(n.b)
        if (e && e[1] === 0 && Number.isInteger(e[0]) && Math.abs(e[0]) <= 64) {
          const k = e[0]
          return (z) => K.powInt(a(z), k)
        }
        if (n.a.k === 'num' && n.a.v[0] === Math.E && n.a.v[1] === 0) {
          const b = build(n.b)
          return (z) => K.exp(b(z))
        }
      }
      const b = build(n.b)
      const op = BIN[n.op]
      return (z) => op(a(z), b(z))
    }
    default:
      throw new Error('nodo inatteso')
  }
}

/** Compila una stringa in una funzione ℂ → ℂ. Lancia un Error con messaggio in italiano. */
export function compile(src: string): Fn {
  if (!src.trim()) throw new Error('scrivi una funzione di z')
  return build(parse(src))
}

export function tryCompile(src: string): { f: Fn; error: null } | { f: null; error: string } {
  try {
    return { f: compile(src), error: null }
  } catch (e) {
    return { f: null, error: (e as Error).message }
  }
}
