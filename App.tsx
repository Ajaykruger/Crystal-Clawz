import React, { useState } from 'react';
import { ProductForm } from './components/ProductForm';
import { PersonaCard } from './components/PersonaCard';
import { generateMarketingPersonas } from './services/gemini';
import { ProductData, Persona, LoadingState } from './types';
import { Sparkles, LayoutGrid, AlertCircle } from 'lucide-react';

export default function App() {
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProductSubmit = async (data: ProductData) => {
    setLoadingState(LoadingState.GENERATING_PERSONAS);
    setError(null);
    setPersonas([]);
    
    try {
      const result = await generateMarketingPersonas(data);
      if (result && result.generated_personas) {
        setPersonas(result.generated_personas);
        setLoadingState(LoadingState.SUCCESS);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate personas. Please verify your API key and try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Sparkles className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PersonaAI <span className="text-indigo-600">Marketer</span></h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            Powered by Google Gemini
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="sticky top-24">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <LayoutGrid size={18} /> Product Details
                </h2>
                <ProductForm onSubmit={handleProductSubmit} isLoading={loadingState === LoadingState.GENERATING_PERSONAS} />
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8 xl:col-span-9">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-800">Generated Strategy</h2>
                {personas.length > 0 && (
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                        {personas.length} Personas Created
                    </span>
                )}
            </div>

            {loadingState === LoadingState.GENERATING_PERSONAS && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 border-dashed">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-slate-600 font-medium">Analyzing product data...</p>
                    <p className="text-slate-400 text-sm">Identifying unique buyer personas</p>
                </div>
            )}

            {loadingState === LoadingState.ERROR && (
                 <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
                    <AlertCircle className="mx-auto h-10 w-10 mb-2 opacity-80" />
                    <p className="font-medium">{error}</p>
                 </div>
            )}

            {loadingState !== LoadingState.GENERATING_PERSONAS && personas.length === 0 && !error && (
                 <div className="flex flex-col items-center justify-center py-20 bg-slate-100 rounded-xl border-2 border-slate-200 border-dashed text-slate-400">
                    <Sparkles className="h-12 w-12 mb-3 opacity-50" />
                    <p className="font-medium">Enter product details to generate personas</p>
                 </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {personas.map((persona) => (
                <PersonaCard key={persona.persona_id} persona={persona} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
