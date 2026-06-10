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
  pseudo: `TOWER-OF-HANOI(n, src, dest, aux):
  if n == 1:
    move disk 1 from src to dest
    return
  TOWER-OF-HANOI(n-1, src, aux, dest)
  move disk n from src to dest
  TOWER-OF-HANOI(n-1, aux, dest, src)`,
  python: `def tower_of_hanoi(n, src, dest, aux):
    if n == 1:
        print(f"Move disk 1 from {src} to {dest}")
        return
    tower_of_hanoi(n - 1, src, aux, dest)
    print(f"Move disk {n} from {src} to {dest}")
    tower_of_hanoi(n - 1, aux, dest, src)`,
  javascript: `function towerOfHanoi(n, src, dest, aux) {
  if (n === 1) {
    console.log("Move disk 1 from " + src + " to " + dest);
    return;
  }
  towerOfHanoi(n - 1, src, aux, dest);
  console.log("Move disk " + n + " from " + src + " to " + dest);
  towerOfHanoi(n - 1, aux, dest, src);
}`,
  cpp: `void towerOfHanoi(int n, char src, char dest, char aux) {
  if (n == 1) {
    cout << "Move disk 1 from " << src
         << " to " << dest << endl;
    return;
  }
  towerOfHanoi(n - 1, src, aux, dest);
  cout << "Move disk " << n << " from " << src
       << " to " << dest << endl;
  towerOfHanoi(n - 1, aux, dest, src);
}`,
};

const TOWER_NAMES = ["Source", "Auxiliary", "Destination"];

function buildSteps(numDisks) {
  const steps = [];
  const towers = [[], [], []];
  for (let i = numDisks; i >= 1; i--) towers[0].push(i);

  steps.push({
    towers: towers.map((t) => [...t]),
    move: null,
    line: 0,
    explanation: `Tower of Hanoi with ${numDisks} disks. Minimum moves: 2^${numDisks} - 1 = ${Math.pow(2, numDisks) - 1}.`,
  });

  function solve(n, src, dest, aux) {
    if (n === 1) {
      const disk = towers[src].pop();
      towers[dest].push(disk);
      steps.push({
        towers: towers.map((t) => [...t]),
        move: { from: src, to: dest, disk },
        line: 2,
        explanation: `Base case: Move disk 1 from ${TOWER_NAMES[src]} → ${TOWER_NAMES[dest]}.`,
      });
      return;
    }
    solve(n - 1, src, aux, dest);
    const disk = towers[src].pop();
    towers[dest].push(disk);
    steps.push({
      towers: towers.map((t) => [...t]),
      move: { from: src, to: dest, disk },
      line: 5,
      explanation: `Move disk ${disk} from ${TOWER_NAMES[src]} → ${TOWER_NAMES[dest]}.`,
    });
    solve(n - 1, aux, dest, src);
  }

  solve(numDisks, 0, 2, 1);

  steps.push({
    towers: towers.map((t) => [...t]),
    move: null,
    line: 6,
    explanation: `✅ All ${numDisks} disks moved to Destination tower in ${Math.pow(2, numDisks) - 1} moves!`,
  });

  return steps;
}

function getDiskColor(size, maxSize) {
  const hue = 195 - ((maxSize - size) / Math.max(maxSize - 1, 1)) * 160;
  return `oklch(0.7 0.18 ${hue})`;
}

function getDiskWidth(size, maxSize) {
  return 30 + size * 25;
}

export default function TowerOfHanoi() {
  const [disks, setDisks] = useState(3);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

  const towers = cur ? cur.towers : Array.from({ length: 3 }, (_, i) => i === 0 ? Array.from({ length: disks }, (_, j) => disks - j) : []);
  const currentMove = cur?.move ?? null;

  const reset = useCallback(() => {
    clearInterval(timer.current);
    setPlaying(false);
    setStepIdx(0);
    setStarted(false);
    setSteps([]);
  }, []);

  const run = (s) => {
    setSteps(s);
    setStepIdx(0);
    setStarted(true);
    setPlaying(true);
    let idx = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      idx++;
      if (idx >= s.length) {
        clearInterval(timer.current);
        setPlaying(false);
        setStepIdx(s.length - 1);
        return;
      }
      setStepIdx(idx);
    }, speed);
  };

  const togglePlay = () => {
    if (!started) {
      run(buildSteps(disks));
      return;
    }
    if (playing) {
      clearInterval(timer.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      let idx = stepIdx;
      timer.current = setInterval(() => {
        idx++;
        if (idx >= steps.length) {
          clearInterval(timer.current);
          setPlaying(false);
          setStepIdx(steps.length - 1);
          return;
        }
        setStepIdx(idx);
      }, speed);
    }
  };

  const selectDisks = (n) => {
    if (started) return;
    setDisks(n);
  };

  return (
    <>
      <SEO data={{ title: "Tower of Hanoi" }} />
      <AlgoPageLayout title="Tower of Hanoi" category="Recursion" categoryHref="/recursion" timeComplexity="O(2^n)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Disk selector */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Number of Disks</p>
              <div className="flex gap-2 flex-wrap">
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    onClick={() => selectDisks(n)}
                    disabled={started}
                    className="w-10 h-10 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
                    style={{
                      background: disks === n ? CYAN : "oklch(0.17 0.03 240)",
                      color: disks === n ? "oklch(0.1 0.02 240)" : "oklch(0.65 0.04 230)",
                      borderWidth: 1,
                      borderColor: disks === n ? CYAN : BORDER,
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">Minimum moves: 2<sup>{disks}</sup> - 1 = {Math.pow(2, disks) - 1} | Step: {stepIdx} / {steps.length || Math.pow(2, disks) - 1}</p>
            </div>

            {/* Tower Visualization */}
            <div className="rounded-xl border p-5" style={{ background: BG, borderColor: BORDER }}>
              <div className="flex flex-col md:flex-row justify-center items-center md:items-end gap-8 min-h-[350px]">
                {towers.map((tower, towerIndex) => (
                  <div key={towerIndex} className="flex flex-col items-center">
                    <div className="text-xs font-medium mb-2" style={{ color: currentMove?.to === towerIndex ? CYAN : currentMove?.from === towerIndex ? "oklch(0.7 0.15 25)" : "oklch(0.5 0.04 240)" }}>
                      {TOWER_NAMES[towerIndex]}
                    </div>
                    <div className="relative flex flex-col-reverse items-center">
                      <div className="rounded-t-full w-2 h-48 md:h-64" style={{ background: `linear-gradient(to top, ${CYAN}, oklch(0.55 0.15 250))` }} />
                      <div
                        className="rounded-none absolute bottom-0"
                        style={{
                          width: `${getDiskWidth(disks, disks) + 40}px`,
                          height: "16px",
                          background: "oklch(0.25 0.04 240)",
                        }}
                      />
                      <div
                        className="opacity-0"
                        style={{
                          width: `${getDiskWidth(disks, disks) + 40}px`,
                          height: "16px",
                        }}
                      />
                      <div className="absolute bottom-5 flex flex-col-reverse items-center">
                        {tower.map((diskSize, diskIndex) => {
                          const isMoving = currentMove && currentMove.from === towerIndex && diskIndex === tower.length - 1;
                          return (
                            <div
                              key={`${towerIndex}-${diskIndex}-${diskSize}`}
                              className="rounded-lg shadow-lg flex items-center justify-center transition-all duration-300"
                              style={{
                                width: `${getDiskWidth(diskSize, disks)}px`,
                                height: "22px",
                                backgroundColor: getDiskColor(diskSize, disks),
                                zIndex: disks - diskSize + 10,
                                borderWidth: 1,
                                borderColor: isMoving ? "#fff" : "oklch(0.2 0.02 240)",
                                transform: isMoving ? "translateY(-24px) scale(1.05)" : "none",
                                boxShadow: isMoving ? `0 0 12px ${getDiskColor(diskSize, disks)}` : "none",
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-xl border p-4 flex flex-wrap gap-3" style={{ background: BG, borderColor: BORDER }}>
              <button onClick={togglePlay} className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm"
                style={{ background: CYAN, color: "oklch(0.1 0.02 240)" }}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {!started ? "Start" : playing ? "Pause" : "Resume"}
              </button>
              <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border text-slate-300"
                style={{ borderColor: BORDER }}>
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
