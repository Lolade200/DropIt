import React, { useState, useEffect } from 'react';
import { 
  Monitor, Tablet, Smartphone, Globe, ShieldCheck, Zap, 
  CheckSquare, Link2, Search, AlertTriangle, CheckCircle, 
  RefreshCw, FileText, ExternalLink, Code, BarChart2, Layers
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('https://example.com');
  const [activeTab, setActiveTab] = useState('preview');
  const [viewport, setViewport] = useState('desktop'); // desktop, tablet, mobile
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Simulated metrics
  const [metrics, setMetrics] = useState({
    performance: 88,
    accessibility: 96,
    bestPractices: 92,
    seo: 100,
    loadTime: '1.2s',
    pageSize: '850 KB',
    requests: 24
  });

  // Simulated SEO data
  const [seoData, setSeoData] = useState({
    title: 'Example Domain - Modern Web Testing Suite',
    description: 'This is a simulated meta description for your website test. Optimized for search engines.',
    h1Count: 1,
    canonical: 'https://example.com',
    robotsTxt: 'Allowed',
    ssl: 'Secure (HTTPS)'
  });

  // Simulated Link Checker data
  const [links, setLinks] = useState([
    { href: '/', text: 'Home', status: 200, type: 'Internal' },
    { href: '/about', text: 'About Us', status: 200, type: 'Internal' },
    { href: '/services', text: 'Services', status: 404, type: 'Internal' },
    { href: 'https://github.com', text: 'GitHub', status: 200, type: 'External' },
    { href: '/contact', text: 'Contact', status: 200, type: 'Internal' }
  ]);

  // Interactive Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, category: 'SEO', text: 'Meta title and description present', completed: true },
    { id: 2, category: 'Performance', text: 'Images properly compressed & lazy loaded', completed: false },
    { id: 3, category: 'Accessibility', text: 'All images have alt attributes', completed: true },
    { id: 4, category: 'Security', text: 'SSL certificate valid and active', completed: true },
    { id: 5, category: 'Responsiveness', text: 'Mobile viewport meta tag configured', completed: true },
    { id: 6, category: 'Links', text: 'No broken internal links (404s)', completed: false }
  ]);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const toggleChecklistItem = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = checklist.filter(i => i.completed).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/30">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              SitePulse Studio
            </h1>
            <p className="text-xs text-slate-400">Comprehensive Website Testing & Inspection</p>
          </div>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 max-w-2xl flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g., https://example.com)"
            className="w-full bg-transparent text-sm focus:outline-none text-slate-200 placeholder-slate-500"
          />
          <button 
            type="submit"
            className="ml-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all flex items-center space-x-1 flex-shrink-0 cursor-pointer shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Test URL</span>
          </button>
        </form>

        <div className="flex items-center space-x-2">
          <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
            Ready
          </span>
        </div>
      </header>

      {}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-4 flex space-x-1 overflow-x-auto">
        {[
          { id: 'preview', label: 'Viewport Preview', icon: Monitor },
          { id: 'seo', label: 'SEO & Meta Checker', icon: FileText },
          { id: 'performance', label: 'Performance Audit', icon: Zap },
          { id: 'links', label: 'Link Inspector', icon: Link2 },
          { id: 'checklist', label: 'Testing Checklist', icon: CheckSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {}
      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Device Viewport:</span>
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button
                    onClick={() => setViewport('desktop')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      viewport === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop (100%)</span>
                  </button>
                  <button
                    onClick={() => setViewport('tablet')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      viewport === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span>Tablet (768px)</span>
                  </button>
                  <button
                    onClick={() => setViewport('mobile')}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      viewport === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (375px)</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>Target: <strong className="text-indigo-300">{url}</strong></span>
                <a href={url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors" title="Open in new tab">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Viewport Frame */}
            <div className="flex justify-center bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 md:p-8 overflow-x-auto min-h-[600px] items-center">
              <div 
                className={`transition-all duration-300 bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-slate-700 flex flex-col ${
                  viewport === 'desktop' ? 'w-full max-w-6xl h-[650px]' :
                  viewport === 'tablet' ? 'w-[768px] h-[650px]' : 'w-[375px] h-[650px]'
                }`}
              >
                {/* Simulated browser header */}
                <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-slate-400 select-none flex-shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <div className="bg-slate-900 px-3 py-1 rounded text-xs text-slate-300 max-w-sm truncate border border-slate-700">
                    {url}
                  </div>
                  <div className="text-xs opacity-60">
                    {viewport.toUpperCase()}
                  </div>
                </div>

                {/* Iframe or fallback preview */}
                <div className="flex-1 relative bg-slate-950">
                  {isLoading && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                      <p className="text-sm text-slate-300 font-medium">Loading test viewport...</p>
                    </div>
                  )}
                  <iframe 
                    key={iframeKey}
                    src={url} 
                    title="Website Live Preview"
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onError={() => console.warn('Iframe blocked by X-Frame-Options or invalid URL.')}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">SEO Health Score</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{seoData.seo} / 100</div>
                <p className="text-xs text-slate-400 mt-1">All critical tags verified.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">H1 Heading Count</span>
                  <Code className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-400">{seoData.h1Count}</div>
                <p className="text-xs text-slate-400 mt-1">Recommended: exactly 1 per page</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">SSL Certificate</span>
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{seoData.ssl}</div>
                <p className="text-xs text-slate-400 mt-1">Secure encryption enabled</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">Robots.txt</span>
                  <FileText className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-lg font-bold text-amber-400 mt-1">{seoData.robotsTxt}</div>
                <p className="text-xs text-slate-400 mt-1">Search indexing permitted</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              <h2 className="text-base font-bold text-slate-200 flex items-center space-x-2">
                <Search className="w-5 h-5 text-indigo-400" />
                <span>Search Engine Result Page (SERP) Preview</span>
              </h2>

              <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 max-w-2xl space-y-1">
                <div className="text-xs text-slate-400 truncate">{seoData.canonical}</div>
                <div className="text-indigo-400 font-medium text-lg hover:underline cursor-pointer">{seoData.title}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{seoData.description}</div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <h3 className="text-sm font-semibold text-slate-300">Detailed Meta Tag Inspection</h3>
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 gap-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Page Title</span>
                      <span className="text-sm text-slate-200 font-medium">{seoData.title}</span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 self-start md:self-auto">
                      Optimal (56 chars)
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 gap-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Meta Description</span>
                      <span className="text-sm text-slate-200">{seoData.description}</span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 self-start md:self-auto">
                      Optimal (112 chars)
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 p-4 rounded-xl border border-slate-800 gap-2">
                    <div>
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Canonical Tag</span>
                      <span className="text-sm text-slate-200 font-mono">{seoData.canonical}</span>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/20 self-start md:self-auto">
                      Valid
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <span className="text-xs text-slate-400 font-medium block mb-1">Performance Score</span>
                <div className="text-3xl font-extrabold text-amber-400">{metrics.performance}/100</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <span className="text-xs text-slate-400 font-medium block mb-1">Accessibility</span>
                <div className="text-3xl font-extrabold text-emerald-400">{metrics.accessibility}/100</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <span className="text-xs text-slate-400 font-medium block mb-1">Best Practices</span>
                <div className="text-3xl font-extrabold text-emerald-400">{metrics.bestPractices}/100</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
                <span className="text-xs text-slate-400 font-medium block mb-1">SEO Audit</span>
                <div className="text-3xl font-extrabold text-emerald-400">{metrics.seo}/100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4">
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-xl text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Page Load Time</span>
                  <span className="text-xl font-bold text-slate-100">{metrics.loadTime}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4">
                <div className="bg-cyan-600/10 border border-cyan-500/20 p-3 rounded-xl text-cyan-400">
                  <BarChart2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Total Page Size</span>
                  <span className="text-xl font-bold text-slate-100">{metrics.pageSize}</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex items-center space-x-4">
                <div className="bg-purple-600/10 border border-purple-500/20 p-3 rounded-xl text-purple-400">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">HTTP Requests</span>
                  <span className="text-xl font-bold text-slate-100">{metrics.requests}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-slate-200">Performance Recommendations</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Serve images in next-gen formats</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Image formats like WebP and AVIF often provide better compression than PNG or JPEG.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">Enable text compression</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Gzip and Brotli compression are correctly configured on your server.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {}
        {activeTab === 'links' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-200">Internal & External Link Analysis</h2>
                <p className="text-xs text-slate-400 mt-0.5">Scanned discovered hyperlinks for broken status codes (404, 500).</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-medium">
                  {links.filter(l => l.status === 200).length} Healthy Links
                </span>
                <span className="text-xs bg-rose-500/10 text-rose-400 px-3 py-1.5 rounded-lg border border-rose-500/20 font-medium">
                  {links.filter(l => l.status !== 200).length} Broken Links
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Link URL</th>
                    <th className="p-3 font-semibold">Anchor Text</th>
                    <th className="p-3 font-semibold">Type</th>
                    <th className="p-3 font-semibold">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {links.map((link, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono text-xs text-indigo-400">{link.href}</td>
                      <td className="p-3 text-slate-300 font-medium">{link.text}</td>
                      <td className="p-3">
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded">
                          {link.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                          link.status === 200 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {link.status === 200 ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                          {link.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {}
        {activeTab === 'checklist' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-200">Pre-Launch Testing Checklist</h2>
                <p className="text-xs text-slate-400 mt-0.5">Track your quality assurance tasks before pushing your website live.</p>
              </div>
              <div className="flex items-center space-x-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Completion Progress</span>
                  <span className="text-sm font-bold text-indigo-400">{completedCount} of {checklist.length} Completed</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-600/20 border-2 border-indigo-500 flex items-center justify-center text-xs font-extrabold text-indigo-300">
                  {progressPercentage}%
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {checklist.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    item.completed 
                      ? 'bg-emerald-950/10 border-emerald-500/30 text-slate-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      item.completed 
                        ? 'bg-emerald-500 border-emerald-400 text-white' 
                        : 'border-slate-600 bg-slate-900'
                    }`}>
                      {item.completed && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className={`text-sm font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.text}
                      </span>
                      <span className="text-xs text-indigo-400 ml-2 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">Click to toggle</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        SitePulse Studio — Professional Website Testing & Quality Assurance Suite
      </footer>
    </div>
  );
}
