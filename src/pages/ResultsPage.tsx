import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SimulationRecord, FutureCase } from '../types';
import { motion } from 'framer-motion'; // Using standard framer-motion import (change back to 'motion/react' if using v12+)
import { AlertTriangle, TrendingUp, TrendingDown, BrainCircuit, ArrowLeft, Loader2, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function ResultsPage() {
  const { id } = useParams();
  const [data, setData] = useState<SimulationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    const fetchDoc = async () => {
      try {
        const d = await getDoc(doc(db, 'simulations', id));
        if (d.exists()) {
          setData(d.data() as SimulationRecord);
        }
      } catch (e) {
        console.error("Error fetching simulation:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoc();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400">
        Simulation not found.
      </div>
    );
  }

  const chartData = [
    { name: 'Best Case', Probability: parseInt(data.output.probabilities.best_case) || 0, fill: '#00f0ff' },
    { name: 'Average Case', Probability: parseInt(data.output.probabilities.average_case) || 0, fill: '#7000ff' },
    { name: 'Worst Case', Probability: parseInt(data.output.probabilities.worst_case) || 0, fill: '#ef4444' }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">New Simulation</span>
        </Link>
        
        <div className="glass p-6 rounded-2xl border-l-[4px] border-l-cyan-500">
          <h1 className="text-2xl font-display font-bold text-white mb-2">
            Synthesis Context: {data.input.futureDecision} over {data.input.timeframe}
          </h1>
          <p className="text-slate-400 text-sm">
            <strong>Base Params:</strong> {data.input.dailyStudyHours}hrs/day | {data.input.productivityLevel} Productivity | {data.input.consistencyLevel} Consistency
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScenarioCard type="best" data={data.output.best_case} prob={data.output.probabilities.best_case} />
          <ScenarioCard type="average" data={data.output.average_case} prob={data.output.probabilities.average_case} />
          <ScenarioCard type="worst" data={data.output.worst_case} prob={data.output.probabilities.worst_case} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-display font-bold glow-text mb-6">Probability Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8'}} />
                  <YAxis stroke="#64748b" tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="Probability" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl space-y-6">
            <h3 className="text-xl font-display font-bold glow-text flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>AI Overseer Analysis</span>
            </h3>
            
            <div className="bg-slate-900/50 rounded-xl p-4 border border-cyan-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">Recommendation</h4>
              <p className="text-slate-300 text-sm leading-relaxed">{data.output.recommendation}</p>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-4 border border-purple-500/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Motivation Override</h4>
              <p className="text-slate-300 text-sm italic">"{data.output.motivation}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

interface ScenarioCardProps {
  type: 'best' | 'average' | 'worst';
  data: FutureCase;
  prob: string;
}

function ScenarioCard({ type, data, prob }: ScenarioCardProps) {
  const styles = {
    best: 'border-t-cyan-400 shadow-[0_-4px_20px_rgba(0,240,255,0.15)] from-cyan-950/40',
    average: 'border-t-purple-400 shadow-[0_-4px_20px_rgba(112,0,255,0.15)] from-purple-950/30',
    worst: 'border-t-red-500 shadow-[0_-4px_20px_rgba(239,68,68,0.1)] from-red-950/20'
  };

  const icons = {
    best: <TrendingUp className="w-5 h-5 text-cyan-400" />,
    average: <Activity className="w-5 h-5 text-purple-400" />,
    worst: <TrendingDown className="w-5 h-5 text-red-500" />
  };

  // Safely parse lists, filtering out empty strings and handling undefined AI outputs
  const parseList = (val: string | string[] | undefined | null): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return String(val)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean); // Removes empty strings
  };

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`glass border-t-4 rounded-xl p-6 bg-gradient-to-b to-transparent ${styles[type]} flex flex-col`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
           {icons[type]}
           <h3 className="font-display font-bold text-lg capitalize">{type} Matrix</h3>
        </div>
        <div className="px-3 py-1 bg-slate-900/80 rounded-lg border border-slate-700 text-xs font-mono font-bold text-slate-300">
           {prob}
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div>
          <h4 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {data.title || data.career_status}
          </h4>
          <p className="text-cyan-400 font-mono text-sm mt-1">{data.salary_estimate || 'N/A'}</p>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">{data.summary}</p>

        <div className="pt-4 border-t border-slate-700/50">
          <h5 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Acquired Assets</h5>
          <div className="flex flex-wrap gap-2">
            {parseList(data.skills_gained).map((s, i) => (
              <span key={i} className="px-2 py-1 text-xs bg-cyan-900/30 text-cyan-300 border border-cyan-800/50 rounded-md">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
           <h5 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1">
             <AlertTriangle className="w-3 h-3 text-amber-500" /> Risk Factors
           </h5>
           <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
             {parseList(data.risks).map((r, i) => (
               <li key={i}>{r}</li>
             ))}
           </ul>
        </div>
      </div>
    </motion.div>
  );
}