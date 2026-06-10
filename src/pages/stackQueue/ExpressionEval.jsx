import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const CODES = {
  pseudo: `INFIX-TO-POSTFIX(expression):
  stack ← empty, output ← empty
  for each char in expression:
    if char is operand:
      append char to output
    else if char = '(':
      push char to stack
    else if char = ')':
      while stack.top ≠ '(':
        pop and append to output
      pop '(' from stack
    else if char is operator:
      while stack not empty AND stack.top ≠ '('
            AND precedence(stack.top) ≥ precedence(char):
        pop and append to output
      push char to stack
  while stack not empty:
    pop and append to output
  return output

EVALUATE-POSTFIX(expression):
  stack ← empty
  for each char in expression:
    if char is digit:
      push int(char) to stack
    else if char is operator:
      b ← pop, a ← pop
      push result of (a op b) to stack
  return stack.top`,
  python: `# Infix to Postfix Conversion
def infix_to_postfix(expression):
    stack = []
    output = []
    precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}

    for char in expression:
        if char.isalnum():
            output.append(char)
        elif char == '(':
            stack.append(char)
        elif char == ')':
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            stack.pop()  # Remove '('
        elif char in precedence:
            while (stack and stack[-1] != '(' and
                   precedence.get(stack[-1], 0) >= precedence[char]):
                output.append(stack.pop())
            stack.append(char)

    while stack:
        output.append(stack.pop())

    return ''.join(output)


# Postfix Evaluation
def evaluate_postfix(expression):
    stack = []

    for char in expression:
        if char.isdigit():
            stack.append(int(char))
        elif char in '+-*/^':
            b = stack.pop()
            a = stack.pop()
            if char == '+': result = a + b
            elif char == '-': result = a - b
            elif char == '*': result = a * b
            elif char == '/': result = a // b
            elif char == '^': result = a ** b
            stack.append(result)

    return stack[0]`,
  javascript: `// Infix to Postfix Conversion
function infixToPostfix(expression) {
  const stack = [];
  const output = [];
  const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };

  for (const char of expression) {
    if (/[a-zA-Z0-9]/.test(char)) {
      output.push(char);
    } else if (char === '(') {
      stack.push(char);
    } else if (char === ')') {
      while (stack.length && stack[stack.length - 1] !== '(') {
        output.push(stack.pop());
      }
      stack.pop();
    } else if (precedence[char] !== undefined) {
      while (stack.length && stack[stack.length - 1] !== '(' &&
             precedence[stack[stack.length - 1]] >= precedence[char]) {
        output.push(stack.pop());
      }
      stack.push(char);
    }
  }

  while (stack.length) output.push(stack.pop());
  return output.join('');
}


// Postfix Evaluation
function evaluatePostfix(expression) {
  const stack = [];

  for (const char of expression) {
    if (/[0-9]/.test(char)) {
      stack.push(parseInt(char));
    } else if ('+-*/^'.includes(char)) {
      const b = stack.pop();
      const a = stack.pop();
      let result;
      if (char === '+') result = a + b;
      else if (char === '-') result = a - b;
      else if (char === '*') result = a * b;
      else if (char === '/') result = Math.floor(a / b);
      else if (char === '^') result = Math.pow(a, b);
      stack.push(result);
    }
  }

  return stack[0];
}`,
  cpp: `// Infix to Postfix Conversion
string infixToPostfix(string expr) {
    stack<char> stk;
    string output;
    unordered_map<char, int> prec = {
        {'+', 1}, {'-', 1}, {'*', 2}, {'/', 2}, {'^', 3}
    };

    for (char ch : expr) {
        if (isalnum(ch)) {
            output += ch;
        } else if (ch == '(') {
            stk.push(ch);
        } else if (ch == ')') {
            while (!stk.empty() && stk.top() != '(') {
                output += stk.top(); stk.pop();
            }
            stk.pop();
        } else if (prec.count(ch)) {
            while (!stk.empty() && stk.top() != '(' &&
                   prec[stk.top()] >= prec[ch]) {
                output += stk.top(); stk.pop();
            }
            stk.push(ch);
        }
    }
    while (!stk.empty()) {
        output += stk.top(); stk.pop();
    }
    return output;
}


// Postfix Evaluation
int evaluatePostfix(string expr) {
    stack<int> stk;

    for (char ch : expr) {
        if (isdigit(ch)) {
            stk.push(ch - '0');
        } else {
            int b = stk.top(); stk.pop();
            int a = stk.top(); stk.pop();
            int result;
            if (ch == '+') result = a + b;
            else if (ch == '-') result = a - b;
            else if (ch == '*') result = a * b;
            else if (ch == '/') result = a / b;
            else if (ch == '^') result = pow(a, b);
            stk.push(result);
        }
    }
    return stk.top();
}`,
};

/* ── helpers ──────────────────────────────────────── */

const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
const isOperator = (char) => ["+", "-", "*", "/", "^"].includes(char);
const isOperand = (char) => /[0-9a-zA-Z]/.test(char);

/* ── buildSteps ───────────────────────────────────── */

function buildStepsPostfix(expr) {
  const steps = [];
  const opStack = [];
  const outputQueue = [];

  // Line mapping for infix_to_postfix in CODES
  // 0: # Infix to Postfix Conversion
  // 1: def infix_to_postfix(expression):
  // 2:     stack = []
  // 3:     output = []
  // 4:     precedence = {...}
  // 5: (empty)
  // 6:     for char in expression:
  // 7:         if char.isalnum():
  // 8:             output.append(char)
  // 9:         elif char == '(':
  // 10:            stack.append(char)
  // 11:        elif char == ')':
  // 12:            while stack and stack[-1] != '(':
  // 13:                output.append(stack.pop())
  // 14:            stack.pop()
  // 15:        elif char in precedence:
  // 16:            while (stack and stack[-1] != '(' and
  // 17:                   precedence.get(stack[-1], 0) >= precedence[char]):
  // 18:                output.append(stack.pop())
  // 19:            stack.append(char)
  // 20: (empty)
  // 21:    while stack:
  // 22:        output.append(stack.pop())
  // 23: (empty)
  // 24:    return ''.join(output)

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (isOperand(char)) {
      outputQueue.push(char);
      steps.push({
        index: i, char,
        operatorStack: [...opStack],
        outputQueue: [...outputQueue],
        highlightStack: -1,
        line: 8,
        explanation: `Add operand '${char}' to output queue.`,
      });
    } else if (char === "(") {
      opStack.push(char);
      steps.push({
        index: i, char,
        operatorStack: [...opStack],
        outputQueue: [...outputQueue],
        highlightStack: opStack.length - 1,
        line: 10,
        explanation: `Push '(' to operator stack.`,
      });
    } else if (char === ")") {
      while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
        const op = opStack.pop();
        outputQueue.push(op);
        steps.push({
          index: i, char,
          operatorStack: [...opStack],
          outputQueue: [...outputQueue],
          highlightStack: opStack.length,
          line: 13,
          explanation: `Pop '${op}' from stack to output (inside parentheses).`,
        });
      }
      if (opStack.length > 0) opStack.pop();
      steps.push({
        index: i, char,
        operatorStack: [...opStack],
        outputQueue: [...outputQueue],
        highlightStack: -1,
        line: 14,
        explanation: `Pop '(' from stack (discarded).`,
      });
    } else if (isOperator(char)) {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1] !== "(" &&
        precedence[opStack[opStack.length - 1]] >= precedence[char]
      ) {
        const op = opStack.pop();
        outputQueue.push(op);
        steps.push({
          index: i, char,
          operatorStack: [...opStack],
          outputQueue: [...outputQueue],
          highlightStack: opStack.length,
          line: 18,
          explanation: `Pop '${op}' (higher or equal precedence) to output.`,
        });
      }
      opStack.push(char);
      steps.push({
        index: i, char,
        operatorStack: [...opStack],
        outputQueue: [...outputQueue],
        highlightStack: opStack.length - 1,
        line: 19,
        explanation: `Push operator '${char}' to stack.`,
      });
    }
  }

  while (opStack.length > 0) {
    const op = opStack.pop();
    outputQueue.push(op);
    steps.push({
      index: expr.length, char: "",
      operatorStack: [...opStack],
      outputQueue: [...outputQueue],
      highlightStack: opStack.length,
      line: 22,
      explanation: `Pop remaining '${op}' to output.`,
    });
  }

  steps.push({
    index: expr.length, char: "",
    operatorStack: [...opStack],
    outputQueue: [...outputQueue],
    highlightStack: -1,
    line: 24,
    explanation: `Conversion complete: ${outputQueue.join("")}`,
  });

  return steps;
}

function buildStepsEvaluate(expr) {
  const steps = [];
  const stack = [];

  // Line mapping for evaluate_postfix in CODES (offset from infix_to_postfix)
  // Lines 27-44 in the combined code
  // 27: # Postfix Evaluation
  // 28: def evaluate_postfix(expression):
  // 29:     stack = []
  // 30: (empty)
  // 31:     for char in expression:
  // 32:         if char.isdigit():
  // 33:             stack.append(int(char))
  // 34:         elif char in '+-*/^':
  // 35:             b = stack.pop()
  // 36:             a = stack.pop()
  // 37:             if char == '+': result = a + b
  // 38:             elif char == '-': result = a - b
  // 39:             elif char == '*': result = a * b
  // 40:             elif char == '/': result = a // b
  // 41:             elif char == '^': result = a ** b
  // 42:             stack.append(result)
  // 43: (empty)
  // 44:     return stack[0]

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if (isOperand(char)) {
      stack.push(parseInt(char));
      steps.push({
        index: i, char,
        operatorStack: [...stack],
        outputQueue: [],
        highlightStack: stack.length - 1,
        line: 33,
        explanation: `Push operand ${char} to stack.`,
      });
    } else if (isOperator(char)) {
      if (stack.length >= 2) {
        const b = stack.pop();
        const a = stack.pop();
        let result;
        switch (char) {
          case "+": result = a + b; break;
          case "-": result = a - b; break;
          case "*": result = a * b; break;
          case "/": result = Math.floor(a / b); break;
          case "^": result = Math.pow(a, b); break;
          default: result = 0;
        }
        stack.push(result);
        steps.push({
          index: i, char,
          operatorStack: [...stack],
          outputQueue: [],
          highlightStack: stack.length - 1,
          line: 37,
          explanation: `Apply ${char}: ${a} ${char} ${b} = ${result}`,
        });
      }
    }
  }

  steps.push({
    index: expr.length, char: "",
    operatorStack: [...stack],
    outputQueue: [],
    highlightStack: 0,
    line: 44,
    explanation: `Evaluation complete: result = ${stack[0]}`,
  });

  return steps;
}

function buildSteps(expression, mode) {
  if (mode === "postfix") {
    return buildStepsPostfix(expression);
  }
  // evaluate mode: first convert to postfix, then evaluate
  const postfixSteps = buildStepsPostfix(expression);
  const postfixExpr = postfixSteps[postfixSteps.length - 1].outputQueue.join("");
  return buildStepsEvaluate(postfixExpr);
}

/* ── sub-components ───────────────────────────────── */

const StackItem = ({ value, index, isHighlighted, isTop }) => (
  <div
    className={`w-20 h-12 border-2 rounded-lg flex items-center justify-center text-white font-bold text-lg
      transition-all duration-300 transform
      ${isHighlighted ? "bg-cyan-400/80 border-cyan-300 scale-105" : ""}
      ${isTop && !isHighlighted ? "shadow-lg shadow-white/20" : ""}
    `}
    style={{
      background: isHighlighted ? undefined : "oklch(0.17 0.03 240)",
      borderColor: isHighlighted ? undefined : BORDER,
      transform: `translateY(${index * -2}px)`,
      zIndex: 100 - index,
    }}
  >
    {value}
  </div>
);

const Stack = ({ items, title, highlightedIndex = -1 }) => (
  <div className="flex flex-col items-center">
    <h3 className="text-white text-lg font-semibold mb-3">{title}</h3>
    <div className="relative min-h-[280px] flex flex-col-reverse items-center justify-start gap-1">
      {items.length === 0 ? (
        <div className="text-neutral-500 text-sm">Empty</div>
      ) : (
        items.map((item, index) => (
          <StackItem key={`${item}-${index}`} value={item} index={index}
            isHighlighted={index === highlightedIndex} isTop={index === items.length - 1} />
        ))
      )}
    </div>
  </div>
);

const ExpressionDisplay = ({ expression, currentIndex, processedPart }) => (
  <div className="text-center mb-6">
    <h3 className="text-white text-lg font-semibold mb-2">Expression</h3>
    <div className="rounded-lg p-3 font-mono text-xl" style={{ background: "oklch(0.09 0.018 240)" }}>
      {expression.split("").map((char, index) => (
        <span key={index}
          className={`px-0.5 transition-all duration-300
            ${index === currentIndex ? "bg-cyan-400 text-black" : "text-white"}
            ${index < currentIndex ? "text-cyan-400" : ""}
          `}
        >
          {char}
        </span>
      ))}
    </div>
    {processedPart && (
      <div className="mt-2 text-cyan-400 font-mono text-sm">
        Result: {processedPart}
      </div>
    )}
  </div>
);

/* ── Main component ───────────────────────────────── */

function ExpEval() {
  const [expression, setExpression] = useState("3+4*2");
  const [mode, setMode] = useState("postfix");
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false); setStepIdx(0); setStarted(false); setSteps([]);
  }, []);

  const run = (s) => {
    setSteps(s); setStepIdx(0); setStarted(true); setPlaying(true);
    let idx = 0; clearInterval(timer.current);
    timer.current = setInterval(() => {
      idx++;
      if (idx >= s.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(s.length - 1); return; }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) { run(buildSteps(expression, mode)); return; }
    if (playing) { clearInterval(timer.current); setPlaying(false); }
    else {
      setPlaying(true); let idx = stepIdx;
      timer.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) { clearInterval(timer.current); setPlaying(false); setStepIdx(steps.length - 1); return; }
        setStepIdx(idx);
      }, speed);
    }
  };

  const handleModeChange = (m) => {
    reset();
    setMode(m);
  };

  const handleExpressionChange = (e) => {
    reset();
    setExpression(e.target.value);
  };

  // Derived state from current step
  const currentIndex = cur ? cur.index : 0;
  const operatorStack = cur ? cur.operatorStack : [];
  const outputQueue = cur ? cur.outputQueue : [];
  const highlightStack = cur ? cur.highlightStack : -1;

  const MODE_OPTIONS = [
    { value: "postfix", label: "Infix → Postfix" },
    { value: "evaluate", label: "Evaluate Postfix" },
  ];

  return (
    <>
      <SEO data={{ title: "Expression Evaluation" }} />
      <AlgoPageLayout title="Expression Evaluation" category="Stack & Queue" categoryHref="/stack-queue" timeComplexity="O(n)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Input section */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Input</p>
              <div className="flex gap-3 flex-wrap items-center">
                <div className="flex items-center gap-2">
                  <label className="text-slate-400 text-sm">Expr:</label>
                  <input
                    type="text"
                    value={expression}
                    onChange={handleExpressionChange}
                    className="px-3 py-2 rounded-lg text-sm text-white outline-none w-36"
                    style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                    onFocus={(e) => (e.target.style.borderColor = CYAN)}
                    onBlur={(e) => (e.target.style.borderColor = BORDER)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-slate-400 text-sm">Mode:</label>
                  <div className="flex gap-1.5">
                    {MODE_OPTIONS.map((opt) => (
                      <button key={opt.value} onClick={() => handleModeChange(opt.value)}
                        className="px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{
                          background: mode === opt.value ? CYAN : "oklch(0.17 0.03 240)",
                          color: mode === opt.value ? "oklch(0.1 0.02 240)" : "rgb(148 163 184)",
                          border: `1px solid ${mode === opt.value ? CYAN : BORDER}`,
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <ExpressionDisplay
                expression={expression}
                currentIndex={currentIndex}
                processedPart={outputQueue.join("")}
              />

              <div className="flex justify-center items-start gap-10 mb-6">
                <Stack
                  items={operatorStack}
                  title={mode === "postfix" ? "Operator Stack" : "Operand Stack"}
                  highlightedIndex={highlightStack}
                />
                {mode === "postfix" && (
                  <Stack items={outputQueue} title="Output Queue" highlightedIndex={-1} />
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3 items-center" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm" style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300" style={{ borderColor: BORDER }}>
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <SpeedControl animationSpeed={speed} setAnimationSpeed={setSpeed} isAnimating={playing} />
            </div>

            <ExplanationPanel steps={steps.map((s) => s.explanation)} currentStep={stepIdx} totalSteps={steps.length} />
          </div>

          <div className="h-[500px] xl:h-auto xl:min-h-[600px]">
            <CodePanel codes={CODES} highlightLine={cur?.line ?? null} />
          </div>
        </div>
      </AlgoPageLayout>
    </>
  );
}

export default ExpEval;
