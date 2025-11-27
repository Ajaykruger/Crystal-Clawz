import React, { useState, ChangeEvent } from 'react';
import { ProductData } from '../types';
import { Upload, X, Plus, Wand2, Link as LinkIcon, Loader2 } from 'lucide-react';
import { analyzeProduct } from '../services/gemini';

interface ProductFormProps {
  onSubmit: (data: ProductData) => void;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProductData>({
    url: '',
    title: '',
    description: '',
    keyFeatures: [],
    price: '',
    brandVoice: '',
    image: null,
  });

  const [featureInput, setFeatureInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        keyFeatures: [...prev.keyFeatures, featureInput.trim()],
      }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: prev.keyFeatures.filter((_, i) => i !== index),
    }));
  };

  const handleAnalyze = async () => {
    if (!formData.url && !formData.image) {
      setAnalyzeError("Please provide a URL or upload an image to analyze.");
      return;
    }
    
    setIsAnalyzing(true);
    setAnalyzeError(null);

    try {
      const analyzedData = await analyzeProduct(formData.url || '', formData.image);
      setFormData(prev => ({
        ...prev,
        title: analyzedData.title || prev.title,
        description: analyzedData.description || prev.description,
        keyFeatures: analyzedData.keyFeatures || prev.keyFeatures,
        price: analyzedData.price || prev.price,
        brandVoice: analyzedData.brandVoice || prev.brandVoice,
      }));
    } catch (error) {
      console.error(error);
      setAnalyzeError("Failed to analyze product. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      
      {/* Analysis Section */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Wand2 size={16} className="text-indigo-600"/> 
            Auto-fill Details with AI
        </h3>
        
        <div>
           <label className="block text-xs font-medium text-slate-500 mb-1">Product Page URL</label>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <LinkIcon size={16} className="text-slate-400" />
             </div>
             <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://myshop.com/products/gel-polish"
                className="w-full pl-10 pr-4 py-2 bg-white text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
             />
           </div>
        </div>

        <div>
           <label className="block text-xs font-medium text-slate-500 mb-1">Product Image</label>
           <div className="flex items-center gap-3">
             <div className="flex-1 relative">
                <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleImageChange} 
                    accept="image/*" 
                />
                <label 
                    htmlFor="file-upload" 
                    className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 border-dashed rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                >
                    {formData.image ? (
                        <span className="text-indigo-600 truncate">{formData.image.name}</span>
                    ) : (
                        <span className="flex items-center gap-2"><Upload size={16} /> Upload Image</span>
                    )}
                </label>
             </div>
           </div>
        </div>

        <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-2 px-4 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2"
        >
            {isAnalyzing ? (
                <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
            ) : (
                <><SparklesIcon /> Analyze & Auto-fill</>
            )}
        </button>
        
        {analyzeError && <p className="text-xs text-red-500">{analyzeError}</p>}
      </div>

      <div className="border-t border-slate-100 my-4"></div>

      {/* Manual Edit Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Product Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Gel Polish Set, UV Cured"
            className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe the product benefits, contents, and usage..."
            className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Price</label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 499.00"
              className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Voice</label>
            <input
              type="text"
              name="brandVoice"
              value={formData.brandVoice}
              onChange={handleChange}
              placeholder="e.g. Chic, Empowering, Professional"
              className="w-full px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Key Features</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              className="flex-1 px-4 py-2 bg-white rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
              placeholder="Add a feature (e.g. 21-Day Wear)"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.keyFeatures.map((feature, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="hover:text-indigo-900"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || isAnalyzing}
        className={`w-full py-3 px-4 rounded-xl text-white font-medium text-lg transition-all shadow-md hover:shadow-lg ${
          isLoading || isAnalyzing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isLoading ? 'Generating Strategies...' : 'Generate Marketing Personas'}
      </button>
    </form>
  );
};

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 3v4"/><path d="M3 9h4"/><path d="M3 5h4"/></svg>
);