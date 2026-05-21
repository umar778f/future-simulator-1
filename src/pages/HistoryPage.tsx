import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { SimulationRecord } from '../types';
import { Link } from 'react-router-dom';
import { Loader2, Calendar, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getLocalUserId } from './DashboardPage';

export default function HistoryPage() {
  const [history, setHistory] = useState<SimulationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const userId = getLocalUserId();
        const q = query(
          collection(db, 'simulations'),
          where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimulationRecord));
        records.sort((a, b) => b.createdAt - a.createdAt);
        setHistory(records);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div>;

  return (
    <div className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold glow-text">Temporal Archive</h1>
          <p className="text-slate-400 mt-1">Review past iterations and baseline scenarios.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center flex flex-col items-center">
            <FileText className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Iterations Found</h3>
            <p className="text-slate-400 mb-6">Your simulation logs are currently empty.</p>
            <Link to="/dashboard" className="px-6 py-2 bg-cyan-500 text-slate-900 font-bold rounded-lg hover:bg-cyan-400 transition-colors">
              Run First Simulation
            </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((record, i) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={`/results/${record.id}`} className="block glass p-6 rounded-2xl hover:bg-slate-800/50 transition-colors group relative overflow-hidden border border-slate-700 hover:border-cyan-500/50">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full group-hover:bg-cyan-500/10 transition-colors" />
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-xs text-slate-400 font-mono">
                    <Calendar className="w-3 h-3 mr-2" />
                    {new Date(record.createdAt).toLocaleString()}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </div>

                <h3 className="text-lg font-display font-bold text-white mb-2 truncate">
                  {record.input.futureDecision}
                </h3>
                
                <div className="flex items-center gap-4 text-xs mt-4">
                  <span className="px-2 py-1 bg-slate-900 rounded-md text-cyan-400 border border-slate-700">
                    {record.input.timeframe}
                  </span>
                  <span className="px-2 py-1 bg-slate-900 rounded-md text-purple-400 border border-slate-700">
                    {record.input.dailyStudyHours} hrs/day
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
