import React, { useState } from 'react';
import { Persona } from '../types';
import { GeneratedImage } from './GeneratedImage';
import { Copy, Check, ChevronDown, ChevronUp, Users, Target, Zap, MousePointer } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  const [expanded, setExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wide">{persona.persona_id}</span>
               <h3 className="text-xl font-bold text-slate-900">{persona.name}</h3>
            </div>
            <p className="text-slate-600 text-sm flex items-center gap-1.5 mt-2">
                <Users size={16} className="text-indigo-500"/>
                {persona.tone_style}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Core Motivations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-indigo-700 font-semibold text-sm uppercase tracking-wider">
                    <Zap size={14} /> Emotional Trigger
                </div>
                <p className="text-slate-800 text-sm">{persona.emotional_trigger}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-red-600 font-semibold text-sm uppercase tracking-wider">
                    <Target size={14} /> Pain Points
                </div>
                <ul className="list-disc list-inside text-slate-800 text-sm space-y-1">
                    {persona.pain_points.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
            </div>
        </div>

        {/* Ad Copy Section */}
        <div>
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                Meta Ad Assets
            </h4>
            
            <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <div className="flex justify-between items-center mb-1">
                         <span className="text-xs font-medium text-slate-500 uppercase">Primary Text Option</span>
                         <button 
                            onClick={() => copyToClipboard(persona.meta_ad_assets.primary_texts[0], `pt-${persona.persona_id}`)} 
                            className="text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {copiedField === `pt-${persona.persona_id}` ? <Check size={14} /> : <Copy size={14} />}
                         </button>
                    </div>
                    {/* Updated to preserve whitespace and newlines */}
                    <div className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                        {persona.meta_ad_assets.primary_texts[0]}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-xs font-medium text-slate-500 uppercase">Headline</span>
                             <button 
                                onClick={() => copyToClipboard(persona.meta_ad_assets.headlines[0], `hl-${persona.persona_id}`)} 
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                                {copiedField === `hl-${persona.persona_id}` ? <Check size={14} /> : <Copy size={14} />}
                             </button>
                         </div>
                         <p className="text-slate-900 font-semibold text-sm">{persona.meta_ad_assets.headlines[0]}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100 flex flex-col justify-center items-center text-center">
                         <span className="text-xs font-medium text-indigo-400 uppercase mb-1">Call To Action</span>
                         <button className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded shadow-sm flex items-center gap-1 hover:bg-indigo-700 transition-colors w-full justify-center">
                            {persona.meta_ad_assets.call_to_action} <MousePointer size={12} />
                         </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Creative & Landing Page - Collapsible */}
        <div className="border-t border-slate-100 pt-4">
            <button 
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-left group"
            >
                <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">Creative Strategy & Landing Page</span>
                {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {expanded && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                     <div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Landing Page Headline</h5>
                        <div className="bg-green-50 text-green-800 p-3 rounded border border-green-100 text-sm font-medium">
                            {persona.meta_ad_assets.landing_page_headline}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Creative Concept ({persona.meta_ad_assets.creative_concept.type})</h5>
                        <p className="text-sm text-slate-700 mb-2">{persona.meta_ad_assets.creative_concept.prompt_for_imagen}</p>
                        
                        {persona.meta_ad_assets.creative_concept.video_script_draft && (
                             <div className="mt-2 p-3 bg-slate-100 rounded text-xs font-mono text-slate-600">
                                <strong>Script Draft:</strong><br/>
                                {persona.meta_ad_assets.creative_concept.video_script_draft}
                             </div>
                        )}

                        <GeneratedImage 
                            prompt={persona.meta_ad_assets.creative_concept.prompt_for_imagen} 
                            type={persona.meta_ad_assets.creative_concept.type as 'IMAGE' | 'VIDEO'} 
                        />
                    </div>

                    <div>
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Targeting Suggestions</h5>
                        <div className="flex flex-wrap gap-2">
                             {persona.targeting_suggestions.map((tag, i) => (
                                 <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">{tag}</span>
                             ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
