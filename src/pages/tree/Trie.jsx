import { useState, useRef, useCallback } from "react";
import { Plus, Search, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `TRIE-INSERT(root, word):
  node = root
  for each char in word:
    if char not in node.children:
      node.children[char] = new TrieNode()
    node = node.children[char]
  node.is_end = True

TRIE-SEARCH(root, word):
  node = root
  for each char in word:
    if char not in node.children:
      return False
    node = node.children[char]
  return node.is_end`,
  python: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                node.children[ch] = TrieNode()
            node = node.children[ch]
        node.is_end = True

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node.children:
                return False
            node = node.children[ch]
        return node.is_end`,
  javascript: `class TrieNode {
  constructor() { this.children = {}; this.isEnd = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch])
        node.children[ch] = new TrieNode();
      node = node.children[ch];
    }
    node.isEnd = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children[ch]) return false;
      node = node.children[ch];
    }
    return node.isEnd;
  }
}`,
  cpp: `struct TrieNode {
  map<char, TrieNode*> children;
  bool isEnd = false;
};
void insert(TrieNode* root, string word) {
  TrieNode* node = root;
  for (char c : word) {
    if (!node->children[c])
      node->children[c] = new TrieNode();
    node = node->children[c];
  }
  node->isEnd = true;
}
bool search(TrieNode* root, string word) {
  TrieNode* node = root;
  for (char c : word)
    if (!node->children[c]) return false;
    else node = node->children[c];
  return node->isEnd;
}`,
};

// Trie node structure for visualization
function makeTrieNode() { return { children: {}, isEnd: false, id: Math.random().toString(36).slice(2) }; }

function trieInsert(root, word, steps) {
  let node = root;
  steps.push({ path: [], char: null, line: 1, explanation: `Inserting "${word}" into trie. Starting at root.` });
  const path = [];
  for (const ch of word.toUpperCase()) {
    if (!node.children[ch]) {
      node.children[ch] = makeTrieNode();
      steps.push({ path: [...path, ch], char: ch, line: 4, explanation: `'${ch}' not in children. Creating new node.` });
    } else {
      steps.push({ path: [...path, ch], char: ch, line: 5, explanation: `'${ch}' already exists. Traverse to it.` });
    }
    node = node.children[ch];
    path.push(ch);
  }
  node.isEnd = true;
  steps.push({ path: [...path], char: null, line: 6, explanation: `✅ Marked end of word "${word}". Insert complete.` });
}

function trieSearch(root, word, steps) {
  let node = root;
  steps.push({ path: [], char: null, found: null, line: 8, explanation: `Searching for "${word}". Starting at root.` });
  const path = [];
  for (const ch of word.toUpperCase()) {
    if (!node.children[ch]) {
      steps.push({ path: [...path], char: ch, found: false, line: 11, explanation: `'${ch}' not in children. ❌ "${word}" not found.` });
      return false;
    }
    path.push(ch);
    node = node.children[ch];
    steps.push({ path: [...path], char: ch, found: null, line: 10, explanation: `'${ch}' found. Moving to next character.` });
  }
  const result = node.isEnd;
  steps.push({ path: [...path], char: null, found: result, line: 13, explanation: result ? `✅ "${word}" found in trie!` : `❌ "${word}" is a prefix but not a complete word.` });
  return result;
}

// Layout trie for SVG
function layoutTrie(node, x, y, spread, label = "", positions = {}, edges = []) {
  const id = node.id;
  positions[id] = { x, y, label, isEnd: node.isEnd };
  const children = Object.entries(node.children);
  const step = children.length > 0 ? spread / children.length : spread;
  const startX = x - (spread / 2) * (children.length - 1);
  children.forEach(([ch, child], i) => {
    const cx = startX + i * spread;
    const cy = y + 60;
    edges.push({ x1: x, y1: y, x2: cx, y2: cy, label: ch, fromId: id, toId: child.id });
    layoutTrie(child, cx, cy, Math.max(spread / 2, 20), ch, positions, edges);
  });
  return { positions, edges };
}

export default function Trie() {
  const [trie, setTrie] = useState(() => makeTrieNode());
  const [words, setWords] = useState([]);
  const [inputWord, setInputWord] = useState("");
  const [opMode, setOpMode] = useState("insert");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [activePath, setActivePath] = useState([]);
  const timerRef = useRef(null);

  const reset = useCallback(() => { clearInterval(timerRef.current); setSteps([]); setStepIdx(0); setActivePath([]); }, []);

  const runOp = () => {
    const word = inputWord.trim().toUpperCase();
    if (!word) return;
    reset();
    const s = [];
    const newTrie = JSON.parse(JSON.stringify(trie));
    if (opMode === "insert") {
      trieInsert(newTrie, word, s);
      setTrie(newTrie);
      setWords(prev => [...new Set([...prev, word])]);
    } else {
      trieSearch(newTrie, word, s);
    }
    setSteps(s); setInputWord("");
    let idx = 0;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timerRef.current); setStepIdx(s.length - 1); setActivePath(s[s.length-1]?.path||[]); return; }
      setStepIdx(idx);
      setActivePath(s[idx]?.path || []);
    }, 700);
  };

  const { positions, edges } = layoutTrie(trie, 260, 30, 200);
  const cur = steps[stepIdx] || null;

  return (
    <>
      <SEO data={{ title: "Trie" }} />
      <AlgoPageLayout title="Trie (Prefix Tree)" category="Tree" categoryHref="/tree" timeComplexity="O(m)" spaceComplexity="O(n·m)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex gap-2 mb-3">
                {[["insert","Insert",<Plus className="w-3.5 h-3.5"/>],["search","Search",<Search className="w-3.5 h-3.5"/>]].map(([m,label,icon])=>(
                  <button key={m} onClick={()=>{reset();setOpMode(m);}}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{background:opMode===m?"oklch(0.75 0.18 195/0.15)":"oklch(0.17 0.03 240)",borderColor:opMode===m?CYAN:BORDER,color:opMode===m?CYAN:"rgb(148 163 184)"}}>
                    {icon}{label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input value={inputWord} onChange={e=>setInputWord(e.target.value.slice(0,8))}
                  onKeyDown={e=>e.key==="Enter"&&runOp()} placeholder="Enter word (e.g. CAT)"
                  className="flex-1 px-3 py-2 rounded-lg text-sm text-white outline-none font-mono"
                  style={{background:"oklch(0.17 0.03 240)",border:`1px solid ${BORDER}`}}
                  onFocus={e=>e.target.style.borderColor=CYAN} onBlur={e=>e.target.style.borderColor=BORDER}/>
                <button onClick={runOp} className="px-5 py-2 rounded-lg text-sm font-semibold" style={{background:CYAN,color:"oklch(0.1 0.02 240)"}}>Run</button>
                <button onClick={()=>{reset();setTrie(makeTrieNode());setWords([]);}} className="px-3 py-2 rounded-lg border text-slate-400" style={{borderColor:BORDER}}>
                  <RotateCcw className="w-4 h-4"/>
                </button>
              </div>
              {words.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {words.map(w=>(
                    <span key={w} className="text-xs px-2 py-1 rounded-full font-mono" style={{background:"oklch(0.75 0.18 195/0.1)",color:CYAN,border:`1px solid oklch(0.75 0.18 195/0.3)`}}>{w}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border p-4 overflow-x-auto" style={{ background: BG, borderColor: BORDER }}>
              <svg width={520} height={280} viewBox="0 0 520 280" className="mx-auto">
                {edges.map((e,i)=>{
                  const pathLen = activePath.length;
                  const edgeInPath = pathLen > 0 && activePath.slice(0, edges.filter(x=>x.toId===e.toId).length).includes(e.label);
                  return (
                    <g key={i}>
                      <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                        stroke={edgeInPath?CYAN:"oklch(0.3 0.05 240)"} strokeWidth={edgeInPath?2:1.5}/>
                      <text x={(e.x1+e.x2)/2-8} y={(e.y1+e.y2)/2} fontSize={11} fontWeight="bold"
                        fill={edgeInPath?CYAN:"oklch(0.55 0.12 230)"}>{e.label}</text>
                    </g>
                  );
                })}
                {Object.entries(positions).map(([id,{x,y,label,isEnd}])=>{
                  const isRoot = label==="";
                  return (
                    <g key={id}>
                      <circle cx={x} cy={y} r={isRoot?16:14}
                        fill={isEnd?"oklch(0.55 0.18 145/0.2)":BG}
                        stroke={isEnd?"oklch(0.55 0.18 145)":BORDER} strokeWidth={2}/>
                      {isEnd && <circle cx={x} cy={y} r={9} fill="none" stroke="oklch(0.55 0.18 145)" strokeWidth={1} opacity={0.5}/>}
                      <text x={x} y={y+1} textAnchor="middle" dominantBaseline="middle" fontSize={isRoot?9:12} fontWeight="bold"
                        fill={isEnd?"oklch(0.8 0.15 145)":"rgb(203 213 225)"}>{isRoot?"root":""}</text>
                    </g>
                  );
                })}
              </svg>
              <p className="text-xs text-center text-slate-600 mt-2">Double circle = end of word</p>
            </div>

            <ExplanationPanel steps={steps.map(s=>s.explanation)} currentStep={stepIdx} totalSteps={steps.length}/>
          </div>
          <div className="h-[500px] xl:h-auto">
            <CodePanel codes={CODES} highlightLine={cur?.line??null}/>
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}
