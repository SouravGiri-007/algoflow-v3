import { useState, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, Clock } from "lucide-react";
import AlgoPageLayout from "../../components/AlgoPageLayout";
import CodePanel from "../../components/utils/CodePanel";
import ExplanationPanel from "../../components/utils/ExplanationPanel";
import SpeedControl from "../../components/utils/SpeedControl";
import SEO from "../../components/SEO";

const CYAN = "oklch(0.75 0.18 195)";
const BG = "oklch(0.13 0.025 240)";
const BORDER = "oklch(0.22 0.04 240)";

const PROCESS_COLORS = {
  P1: { bg: "oklch(0.65 0.2 25 / 0.4)", border: "oklch(0.7 0.2 25)", text: "oklch(0.85 0.15 25)" },
  P2: { bg: "oklch(0.65 0.15 250 / 0.4)", border: "oklch(0.7 0.18 250)", text: "oklch(0.85 0.12 250)" },
  P3: { bg: "oklch(0.75 0.18 195 / 0.4)", border: CYAN, text: CYAN },
  P4: { bg: "oklch(0.75 0.18 85 / 0.4)", border: "oklch(0.8 0.18 85)", text: "oklch(0.85 0.15 85)" },
  P5: { bg: "oklch(0.65 0.2 300 / 0.4)", border: "oklch(0.7 0.2 300)", text: "oklch(0.85 0.15 300)" },
  P6: { bg: "oklch(0.65 0.18 350 / 0.4)", border: "oklch(0.7 0.18 350)", text: "oklch(0.85 0.15 350)" },
  P7: { bg: "oklch(0.55 0.15 270 / 0.4)", border: "oklch(0.65 0.18 270)", text: "oklch(0.8 0.12 270)" },
  P8: { bg: "oklch(0.7 0.18 55 / 0.4)", border: "oklch(0.75 0.2 55)", text: "oklch(0.85 0.15 55)" },
};

function getProcessColor(pid) {
  return PROCESS_COLORS[pid] || { bg: "oklch(0.5 0.04 240 / 0.4)", border: "oklch(0.4 0.06 240)", text: "oklch(0.65 0.04 230)" };
}

const CODES = {
  pseudo: `ROUND-ROBIN(processes, quantum):
  queue = empty
  time = 0
  add all arrived processes to queue
  while queue is not empty:
    current = dequeue front
    execute = min(quantum, current.remaining)
    time += execute
    current.remaining -= execute
    add new arrivals to queue
    if current.remaining == 0:
      mark completed
    else:
      enqueue current (preempted)
  return completed processes`,
  python: `def round_robin(processes, quantum):
    queue = []
    time = 0
    arrived = set()
    completed = []
    while len(completed) < len(processes):
        for p in processes:
            if p.arrival <= time and p.id not in arrived:
                queue.append(p)
                arrived.add(p.id)
        if not queue:
            time += 1
            continue
        current = queue.pop(0)
        exec_time = min(quantum, current.remaining)
        current.remaining -= exec_time
        time += exec_time
        for p in processes:
            if p.arrival <= time and p.id not in arrived:
                queue.append(p)
                arrived.add(p.id)
        if current.remaining == 0:
            current.completion = time
            completed.append(current)
        else:
            queue.append(current)
    return completed`,
  javascript: `function roundRobin(processes, quantum) {
  const queue = [];
  let time = 0;
  const arrived = new Set();
  const completed = [];
  while (completed.length < processes.length) {
    processes.forEach(p => {
      if (p.arrival <= time && !arrived.has(p.id)) {
        queue.push(p); arrived.add(p.id);
      }
    });
    if (queue.length === 0) { time++; continue; }
    const current = queue.shift();
    const exec = Math.min(quantum, current.remaining);
    current.remaining -= exec;
    time += exec;
    processes.forEach(p => {
      if (p.arrival <= time && !arrived.has(p.id)) {
        queue.push(p); arrived.add(p.id);
      }
    });
    if (current.remaining === 0) {
      current.completion = time;
      completed.push(current);
    } else {
      queue.push(current);
    }
  }
  return completed;
}`,
  cpp: `vector<Process> roundRobin(vector<Process>& procs, int q) {
  queue<int> ready;
  vector<Process> done;
  int time = 0, finished = 0;
  while (finished < procs.size()) {
    for (auto& p : procs)
      if (p.arrival <= time && !p.visited)
        { ready.push(p.id); p.visited = true; }
    if (ready.empty()) { time++; continue; }
    int cur = ready.front(); ready.pop();
    int exec = min(q, procs[cur].remaining);
    procs[cur].remaining -= exec;
    time += exec;
    for (auto& p : procs)
      if (p.arrival <= time && !p.visited)
        { ready.push(p.id); p.visited = true; }
    if (procs[cur].remaining == 0) {
      procs[cur].completion = time;
      done.push_back(procs[cur]);
      finished++;
    } else ready.push(cur);
  }
  return done;
}`,
};

const DEFAULT_PROCESSES = [
  { id: "P1", burstTime: 10, arrivalTime: 0 },
  { id: "P2", burstTime: 5, arrivalTime: 1 },
  { id: "P3", burstTime: 8, arrivalTime: 2 },
  { id: "P4", burstTime: 3, arrivalTime: 3 },
];

function buildSteps(processes, quantum) {
  const steps = [];
  let time = 0;
  const procs = processes.map((p) => ({ ...p, remainingTime: p.burstTime, completionTime: 0, turnaroundTime: 0, waitingTime: 0 }));
  let queue = [];
  let completed = [];
  let gantt = [];
  const arrived = new Set();

  steps.push({
    time: 0, queue: [], currentProcess: null, processesState: procs.map((p) => ({ ...p })),
    ganttChart: [], completedProcesses: [], timeSliceUsed: 0,
    line: 0, explanation: `Round Robin scheduling started with time quantum = ${quantum}. ${procs.length} processes loaded.`,
  });

  while (completed.length < procs.length) {
    procs.forEach((p) => {
      if (p.arrivalTime <= time && !arrived.has(p.id) && p.remainingTime > 0) {
        queue.push(p.id);
        arrived.add(p.id);
        steps.push({
          time, queue: [...queue], currentProcess: null, processesState: procs.map((pp) => ({ ...pp })),
          ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
          line: 4, explanation: `Process ${p.id} arrived at time ${time} and added to ready queue.`,
        });
      }
    });

    if (queue.length === 0) {
      time++;
      steps.push({
        time, queue: [], currentProcess: null, processesState: procs.map((pp) => ({ ...pp })),
        ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
        line: 8, explanation: `CPU idle at time ${time} — waiting for processes.`,
      });
      continue;
    }

    const currentProcessId = queue.shift();
    const currentProc = procs.find((p) => p.id === currentProcessId);
    const executeTime = Math.min(quantum, currentProc.remainingTime);

    steps.push({
      time, queue: [...queue], currentProcess: currentProcessId, processesState: procs.map((pp) => ({ ...pp })),
      ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
      line: 9, explanation: `Process ${currentProcessId} selected from ready queue (Remaining: ${currentProc.remainingTime}).`,
    });

    for (let slice = 1; slice <= executeTime; slice++) {
      time++;
      currentProc.remainingTime--;
      procs.forEach((p) => {
        if (p.arrivalTime <= time && !arrived.has(p.id) && p.remainingTime > 0 && p.id !== currentProcessId) {
          queue.push(p.id);
          arrived.add(p.id);
        }
      });
      steps.push({
        time, queue: [...queue], currentProcess: currentProcessId, processesState: procs.map((pp) => ({ ...pp })),
        ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: slice,
        line: 11, explanation: `Process ${currentProcessId} executing... Time slice used: ${slice}/${executeTime}.`,
      });
    }

    gantt.push({ processId: currentProcessId, startTime: time - executeTime, endTime: time });

    if (currentProc.remainingTime === 0) {
      currentProc.completionTime = time;
      currentProc.turnaroundTime = currentProc.completionTime - currentProc.arrivalTime;
      currentProc.waitingTime = currentProc.turnaroundTime - currentProc.burstTime;
      completed.push({ ...currentProc });
      steps.push({
        time, queue: [...queue], currentProcess: null, processesState: procs.map((pp) => ({ ...pp })),
        ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
        line: 13, explanation: `✅ Process ${currentProcessId} completed! TAT: ${currentProc.turnaroundTime}, WT: ${currentProc.waitingTime}.`,
      });
    } else {
      queue.push(currentProcessId);
      steps.push({
        time, queue: [...queue], currentProcess: null, processesState: procs.map((pp) => ({ ...pp })),
        ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
        line: 16, explanation: `Process ${currentProcessId} preempted (quantum expired), added back to queue.`,
      });
    }
  }

  const avgWT = completed.reduce((s, p) => s + p.waitingTime, 0) / completed.length;
  const avgTAT = completed.reduce((s, p) => s + p.turnaroundTime, 0) / completed.length;
  steps.push({
    time, queue: [], currentProcess: null, processesState: procs.map((pp) => ({ ...pp })),
    ganttChart: [...gantt], completedProcesses: [...completed], timeSliceUsed: 0,
    line: 17, explanation: `✅ All processes completed! Avg WT: ${avgWT.toFixed(2)}, Avg TAT: ${avgTAT.toFixed(2)}.`,
  });

  return steps;
}

export default function RoundRobin() {
  const [processes, setProcesses] = useState(DEFAULT_PROCESSES);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [steps, setSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [started, setStarted] = useState(false);
  const timer = useRef(null);
  const cur = steps[stepIdx] || null;

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
      run(buildSteps(processes, timeQuantum));
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

  const addProcess = () => {
    if (started) return;
    const newId = `P${processes.length + 1}`;
    const bt = Math.floor(Math.random() * 10) + 3;
    const at = Math.floor(Math.random() * 5);
    setProcesses([...processes, { id: newId, burstTime: bt, arrivalTime: at }]);
  };

  const currentTime = cur?.time ?? 0;
  const readyQueue = cur?.queue ?? [];
  const currentProcess = cur?.currentProcess ?? null;
  const ganttChart = cur?.ganttChart ?? [];
  const completedProcesses = cur?.completedProcesses ?? [];
  const timeSliceUsed = cur?.timeSliceUsed ?? 0;
  const processState = cur?.processesState ?? processes.map((p) => ({ ...p, remainingTime: p.burstTime, completionTime: 0, turnaroundTime: 0, waitingTime: 0 }));

  return (
    <>
      <SEO data={{ title: "Round Robin CPU Scheduling" }} />
      <AlgoPageLayout title="Round Robin CPU Scheduling" category="Stack & Queue" categoryHref="/stack-queue" timeComplexity="O(n)" spaceComplexity="O(n)">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            {/* Input/Config */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Configuration</p>
              <div className="flex gap-3 flex-wrap items-end">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Time Quantum</label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={timeQuantum}
                      onChange={(e) => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                      disabled={started}
                      className="w-16 px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "oklch(0.17 0.03 240)", border: `1px solid ${BORDER}` }}
                      min="1"
                    />
                  </div>
                </div>
                <button
                  onClick={addProcess}
                  disabled={started}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border text-slate-300 disabled:opacity-40"
                  style={{ borderColor: BORDER }}
                >
                  <Plus className="w-4 h-4" /> Add Process
                </button>
                <span className="text-xs text-slate-500 ml-auto">{processes.length} processes | Time: {currentTime}</span>
              </div>
            </div>

            {/* Process Table */}
            <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Process Information</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b" style={{ borderColor: BORDER }}>
                      <th className="text-slate-400 py-2 px-3 text-left">Process</th>
                      <th className="text-slate-400 py-2 px-3 text-center">Arrival</th>
                      <th className="text-slate-400 py-2 px-3 text-center">Burst</th>
                      <th className="text-slate-400 py-2 px-3 text-center">Remaining</th>
                      <th className="text-slate-400 py-2 px-3 text-center">Completion</th>
                      <th className="text-slate-400 py-2 px-3 text-center">TAT</th>
                      <th className="text-slate-400 py-2 px-3 text-center">WT</th>
                      <th className="text-slate-400 py-2 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processState.map((p) => {
                      const pc = getProcessColor(p.id);
                      const isRunning = p.id === currentProcess;
                      const isReady = readyQueue.includes(p.id);
                      const isDone = p.remainingTime === 0;
                      return (
                        <tr key={p.id} className="border-b" style={{ borderColor: "oklch(0.18 0.03 240)" }}>
                          <td className="py-2 px-3">
                            <div className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                              style={{ background: pc.bg, borderColor: pc.border, color: pc.text, borderWidth: 1 }}>
                              {p.id}
                            </div>
                          </td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.arrivalTime}</td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.burstTime}</td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.remainingTime}</td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.completionTime || "-"}</td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.turnaroundTime || "-"}</td>
                          <td className="text-slate-300 py-2 px-3 text-center">{p.waitingTime || "-"}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold"
                              style={{
                                background: isDone ? "oklch(0.2 0.12 145 / 0.4)" : isRunning ? "oklch(0.75 0.18 195 / 0.2)" : isReady ? "oklch(0.2 0.12 250 / 0.3)" : "oklch(0.17 0.03 240)",
                                color: isDone ? "oklch(0.7 0.15 145)" : isRunning ? CYAN : isReady ? "oklch(0.7 0.12 250)" : "oklch(0.5 0.04 240)",
                                borderWidth: 1,
                                borderColor: isDone ? "oklch(0.4 0.12 145)" : isRunning ? CYAN : isReady ? "oklch(0.4 0.12 250)" : BORDER,
                              }}>
                              {isDone ? "Done" : isRunning ? "Running" : isReady ? "Ready" : "Waiting"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CPU & Ready Queue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CPU */}
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: CYAN }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: CYAN }}>CPU</p>
                <div className="flex justify-center items-center min-h-[80px]">
                  {currentProcess ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-sm border"
                        style={{ background: getProcessColor(currentProcess).bg, borderColor: getProcessColor(currentProcess).border, color: getProcessColor(currentProcess).text, borderWidth: 2 }}>
                        {currentProcess}
                      </div>
                      <div className="text-xs" style={{ color: CYAN }}>
                        {timeSliceUsed}/{Math.min(timeQuantum, processState.find((p) => p.id === currentProcess)?.remainingTime + timeSliceUsed || 0)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">Idle</div>
                  )}
                </div>
              </div>

              {/* Ready Queue */}
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ready Queue</p>
                <div className="flex justify-center items-center gap-2 min-h-[80px] flex-wrap">
                  {readyQueue.map((pid, idx) => {
                    const pc = getProcessColor(pid);
                    return (
                      <div key={`q-${pid}-${idx}`} className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs border"
                          style={{ background: pc.bg, borderColor: pc.border, color: pc.text, borderWidth: 1 }}>
                          {pid}
                        </div>
                        <div className="text-[10px] text-slate-600">{idx}</div>
                      </div>
                    );
                  })}
                  {readyQueue.length === 0 && <div className="text-slate-500 text-sm">Empty</div>}
                </div>
              </div>
            </div>

            {/* Gantt Chart */}
            {ganttChart.length > 0 && (
              <div className="rounded-xl border p-4" style={{ background: BG, borderColor: BORDER }}>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Gantt Chart</p>
                <div className="flex items-center justify-start gap-1 overflow-x-auto pb-2">
                  {ganttChart.map((seg, i) => {
                    const pc = getProcessColor(seg.processId);
                    return (
                      <div key={i} className="flex flex-col items-center gap-1 min-w-max">
                        <div className="px-3 py-2 rounded text-sm font-semibold min-w-[60px] text-center border"
                          style={{ background: pc.bg, borderColor: pc.border, color: pc.text, borderWidth: 1 }}>
                          {seg.processId}
                        </div>
                        <div className="text-[10px] text-slate-500">{seg.startTime}-{seg.endTime}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
