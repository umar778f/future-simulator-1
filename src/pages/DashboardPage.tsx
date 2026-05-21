import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2, Zap } from 'lucide-react';
import { SimulationInput, SimulationOutput } from '../types';

export function getLocalUserId() {
  let uid = localStorage.getItem('localUserId');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('localUserId', uid);
  }
  return uid;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SimulationInput>({
    name: 'Neural Agent',
    educationLevel: 'Bachelors in Computer Science',
    currentSkills: 'React, TypeScript, Python',
    careerGoals: 'Senior AI Engineer or Tech Lead',
    dailyStudyHours: 2,
    productivityLevel: 'High',
    consistencyLevel: 'Average',
    technologies: 'TensorFlow, Next.js, Node',
    futureDecision: 'Learn AI full time for 6 months',
    timeframe: '1 Year'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(d => ({ ...d, [e.target.name]: e.target.value }));
  };

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Simulation failed to generate");
      }
      const output: SimulationOutput = await res.json();
      
      const simulationId = crypto.randomUUID();
      await setDoc(doc(db, 'simulations', simulationId), {
        userId: getLocalUserId(),
        input: formData,
        output,
        createdAt: Date.now()
      });

      navigate(`/results/${simulationId}`);
    } catch (err: any) {
      console.error(err);
      alert(`Simulation Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto py-12">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass w-full rounded-2xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <h2 className="text-3xl font-display font-bold glow-text mb-2">Configure Parameters</h2>
        <p className="text-slate-400 mb-8">Define your current state to initiate the simulation protocol.</p>
        
        <form onSubmit={handleSimulate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Identity Alias" name="name" value={formData.name} onChange={handleChange} />
            <InputGroup label="Education Level" name="educationLevel" value={formData.educationLevel} onChange={handleChange} />
            <InputGroup label="Current Skillset" name="currentSkills" value={formData.currentSkills} onChange={handleChange} />
            <InputGroup label="Career Objectives" name="careerGoals" value={formData.careerGoals} onChange={handleChange} />
            
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Daily Study/Work Hours: {formData.dailyStudyHours}</label>
              <input 
                type="range" min="0" max="16" step="0.5"
                name="dailyStudyHours"
                value={formData.dailyStudyHours}
                onChange={handleChange}
                className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <SelectGroup label="Productivity Core" name="productivityLevel" value={formData.productivityLevel} onChange={handleChange} options={['Low', 'Average', 'High', 'Elite']} />
            <SelectGroup label="Consistency Rating" name="consistencyLevel" value={formData.consistencyLevel} onChange={handleChange} options={['Sporadic', 'Average', 'Disciplined', 'Relentless']} />
            <SelectGroup label="Simulation Horizon" name="timeframe" value={formData.timeframe} onChange={handleChange} options={['3 Months', '6 Months', '1 Year', '5 Years']} />
          </div>

          <div className="space-y-6 pt-4">
            <TextAreaGroup label="Target Technologies (Comma separated)" name="technologies" value={formData.technologies} onChange={handleChange} />
            <TextAreaGroup label="Pending Future Decision (e.g. Quitting job to freelance)" name="futureDecision" value={formData.futureDecision} onChange={handleChange} />
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-700/50">
            <button
              disabled={loading}
              type="submit"
              className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-slate-900 font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              <span>{loading ? "Synthesizing Timelines..." : "Initialize Simulation"}</span>
            </button>
          </div>
        </form>
      </motion.div>
      
      {loading && (
         <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
            <h3 className="font-display font-bold text-2xl text-cyan-400 animate-pulse">Running Neural Simulation</h3>
            <p className="text-slate-400 mt-2">Computing trillions of probabilistic outcomes...</p>
         </div>
      )}
    </div>
  );
}

function InputGroup({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <input 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm"
        {...props} 
      />
    </div>
  );
}

function SelectGroup({ label, options, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <select 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm appearance-none"
        {...props}
      >
        {options.map((o: string) => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
    </div>
  );
}

function TextAreaGroup({ label, ...props }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <textarea 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm resize-none h-24"
        {...props} 
      />
    </div>
  );
}
