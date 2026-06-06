import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "./pages/home/Home";
import NotFoundPage from "./pages/NotFound";
import TopicsPage from "./components/TopicsList";

// Array & LinkedList
const KadanesAlgorithm    = lazy(() => import("./pages/arrayLinkedList/Kadane"));
const FloydCycleDetection  = lazy(() => import("./pages/arrayLinkedList/FloydsCycleDetection"));
const DynamicArray         = lazy(() => import("./pages/arrayLinkedList/DynamicArray"));
const BinarySearch         = lazy(() => import("./pages/arrayLinkedList/BinarySearch"));
// Searching
const LinearSearch         = lazy(() => import("./pages/searching/LinearSearch"));
const JumpSearch           = lazy(() => import("./pages/searching/JumpSearch"));
const InterpolationSearch  = lazy(() => import("./pages/searching/InterpolationSearch"));
// Stack & Queue
const ExpEval    = lazy(() => import("./pages/stackQueue/ExpressionEval"));
const RoundRobin = lazy(() => import("./pages/stackQueue/RoundRobin"));
// Recursion
const TowerOfHanoi    = lazy(() => import("./pages/recursion/TowerOfHanoi"));
const JosephusProblem = lazy(() => import("./pages/recursion/Josephous"));
const QuickSort       = lazy(() => import("./pages/recursion/QuickSort"));
const MergeSort       = lazy(() => import("./pages/recursion/MergeSort"));
// Sorting
const BubbleSort    = lazy(() => import("./pages/sorting/BubbleSort"));
const SelectionSort = lazy(() => import("./pages/sorting/SelectionSort"));
const InsertionSort = lazy(() => import("./pages/sorting/InsertionSort"));
const HeapSort      = lazy(() => import("./pages/sorting/HeapSort"));
const CountingSort  = lazy(() => import("./pages/sorting/CountingSort"));
const RadixSort     = lazy(() => import("./pages/sorting/RadixSort"));
// Tree
const LevelOrderTraversal = lazy(() => import("./pages/tree/LevelOrderTraversal"));
const RedBlackTree        = lazy(() => import("./pages/tree/RedBlackTree"));
const AVLTree             = lazy(() => import("./pages/tree/AVLTree"));
const BSTOperations       = lazy(() => import("./pages/tree/BSTOperations"));
const TreeTraversals      = lazy(() => import("./pages/tree/TreeTraversals"));
const Trie                = lazy(() => import("./pages/tree/Trie"));
// Graph
const DFS             = lazy(() => import("./pages/graph/dfs"));
const BFS             = lazy(() => import("./pages/graph/bfs"));
const FloydWarshall   = lazy(() => import("./pages/graph/floyed-warshall"));
const Dijkstra        = lazy(() => import("./pages/graph/dijkstra"));
const BellmanFord     = lazy(() => import("./pages/graph/BellmanFord"));
const PrimsMST        = lazy(() => import("./pages/graph/PrimsMST"));
const KruskalsMST     = lazy(() => import("./pages/graph/KruskalsMST"));
const TopologicalSort = lazy(() => import("./pages/graph/TopologicalSort"));
const CycleDetection  = lazy(() => import("./pages/graph/CycleDetection"));
// DP
const Fibonacci = lazy(() => import("./pages/dp/Fibonacci"));
const Knapsack  = lazy(() => import("./pages/dp/Knapsack"));
const LCS       = lazy(() => import("./pages/dp/LCS"));
const CoinChange = lazy(() => import("./pages/dp/CoinChange"));
// String
const KMP       = lazy(() => import("./pages/string/KMP"));
const RabinKarp = lazy(() => import("./pages/string/RabinKarp"));
// Backtracking
const SubsetGen = lazy(() => import("./pages/backtracking/SubSetGen"));

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: "oklch(0.1 0.02 240)" }}>
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-t-cyan-400 border-cyan-400/20 animate-spin" />
      <span className="text-slate-500 text-sm">Loading…</span>
    </div>
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* Array */}
            <Route path="/array-linkedlist" element={<TopicsPage topicID={0} />} />
            <Route path="/array-linkedlist/kadane-algo" element={<KadanesAlgorithm />} />
            <Route path="/array-linkedlist/floyds-cycle-detection-algorithm" element={<FloydCycleDetection />} />
            <Route path="/array-linkedlist/dynamic-array" element={<DynamicArray />} />
            <Route path="/array-linkedlist/binary-search" element={<BinarySearch />} />
            {/* Searching */}
            <Route path="/searching" element={<TopicsPage topicID={8} />} />
            <Route path="/searching/linear-search" element={<LinearSearch />} />
            <Route path="/searching/jump-search" element={<JumpSearch />} />
            <Route path="/searching/interpolation-search" element={<InterpolationSearch />} />
            {/* Stack Queue */}
            <Route path="/stack-queue" element={<TopicsPage topicID={2} />} />
            <Route path="/stack-queue/expression-evaluation" element={<ExpEval />} />
            <Route path="/stack-queue/round-robin" element={<RoundRobin />} />
            {/* Recursion */}
            <Route path="/recursion" element={<TopicsPage topicID={1} />} />
            <Route path="/recursion/tower-of-hanoi" element={<TowerOfHanoi />} />
            <Route path="/recursion/josephus-problem" element={<JosephusProblem />} />
            <Route path="/recursion/quick-sort" element={<QuickSort />} />
            <Route path="/recursion/merge-sort" element={<MergeSort />} />
            {/* Sorting */}
            <Route path="/sorting" element={<TopicsPage topicID={7} />} />
            <Route path="/sorting/bubble-sort" element={<BubbleSort />} />
            <Route path="/sorting/selection-sort" element={<SelectionSort />} />
            <Route path="/sorting/insertion-sort" element={<InsertionSort />} />
            <Route path="/sorting/heap-sort" element={<HeapSort />} />
            <Route path="/sorting/counting-sort" element={<CountingSort />} />
            <Route path="/sorting/radix-sort" element={<RadixSort />} />
            {/* Tree */}
            <Route path="/tree" element={<TopicsPage topicID={3} />} />
            <Route path="/tree/level-order-traversal" element={<LevelOrderTraversal />} />
            <Route path="/tree/red-black-tree" element={<RedBlackTree />} />
            <Route path="/tree/avl-tree" element={<AVLTree />} />
            <Route path="/tree/bst-operations" element={<BSTOperations />} />
            <Route path="/tree/tree-traversals" element={<TreeTraversals />} />
            <Route path="/tree/trie" element={<Trie />} />
            {/* Graph */}
            <Route path="/graph" element={<TopicsPage topicID={4} />} />
            <Route path="/graph/bfs" element={<BFS />} />
            <Route path="/graph/dfs" element={<DFS />} />
            <Route path="/graph/dijkstra" element={<Dijkstra />} />
            <Route path="/graph/floyd-warshall" element={<FloydWarshall />} />
            <Route path="/graph/bellman-ford" element={<BellmanFord />} />
            <Route path="/graph/prims-mst" element={<PrimsMST />} />
            <Route path="/graph/kruskals-mst" element={<KruskalsMST />} />
            <Route path="/graph/topological-sort" element={<TopologicalSort />} />
            <Route path="/graph/cycle-detection" element={<CycleDetection />} />
            {/* DP */}
            <Route path="/dp" element={<TopicsPage topicID={9} />} />
            <Route path="/dp/fibonacci" element={<Fibonacci />} />
            <Route path="/dp/knapsack" element={<Knapsack />} />
            <Route path="/dp/lcs" element={<LCS />} />
            <Route path="/dp/coin-change" element={<CoinChange />} />
            {/* String */}
            <Route path="/string" element={<TopicsPage topicID={10} />} />
            <Route path="/string/kmp" element={<KMP />} />
            <Route path="/string/rabin-karp" element={<RabinKarp />} />
            {/* Greedy */}
            <Route path="/greedy" element={<TopicsPage topicID={5} />} />
            {/* Backtracking */}
            <Route path="/backtracking" element={<TopicsPage topicID={6} />} />
            <Route path="/backtracking/subset-generation" element={<SubsetGen />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}
