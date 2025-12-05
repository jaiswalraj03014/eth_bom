import React, { useState, useEffect, useRef, MouseEvent } from 'react';
import { 
  Upload, 
  X, 
  Zap, 
  Download, 
  Sparkles, 
  Ticket
} from 'lucide-react';

// --- CUSTOM STYLES & ANIMATIONS ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=JetBrains+Mono:wght@500&family=Outfit:wght@400;600;800&display=swap');

    :root {
      --eth-red: #e82024;
      --eth-cream: #FFF8F3;
      --eth-yellow: #FFD233;
      --eth-blue: #3B82F6;
      --eth-black: #1A1A1A;
    }

    body {
      background-color: var(--eth-red);
      font-family: 'Outfit', sans-serif;
      overflow-x: hidden;
    }

    .font-logo { font-family: 'Fredoka', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* PARALLAX CLOUDS */
    @keyframes float-cloud {
      0% { transform: translateX(0px); }
      50% { transform: translateX(20px); }
      100% { transform: translateX(0px); }
    }
    .cloud-anim { animation: float-cloud 8s ease-in-out infinite alternate; }
    .cloud-anim-reverse { animation: float-cloud 10s ease-in-out infinite alternate-reverse; }
    .cloud-anim-slow { animation: float-cloud 12s ease-in-out infinite alternate; }

    /* MARQUEE TICKER */
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-container {
      display: flex;
      overflow: hidden;
      white-space: nowrap;
    }
    .marquee-content {
      display: flex;
      animation: marquee 20s linear infinite;
    }

    /* TICKET PRINTING ANIMATION */
    @keyframes print-ticket {
      0% { transform: translateY(-100%); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .ticket-reveal {
      animation: print-ticket 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    /* HARD SHADOWS (Neo-Brutalism) */
    .hard-shadow {
      box-shadow: 4px 4px 0px var(--eth-black);
      transition: all 0.2s ease;
    }
    .hard-shadow:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px 0px var(--eth-black);
    }
    .hard-shadow:active {
      transform: translate(0px, 0px);
      box-shadow: 2px 2px 0px var(--eth-black);
    }

    /* BUS BOUNCE */
    @keyframes bus-drive {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    .bus-body { animation: bus-drive 0.6s infinite ease-in-out; }

    /* PATTERN BACKGROUND */
    .bg-pattern {
      background-image: radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px);
      background-size: 30px 30px;
    }
  `}</style>
);

// --- VISUAL COMPONENTS ---

const Marquee = () => (
  <div className="w-full bg-black text-white py-2 overflow-hidden border-y-2 border-black z-50 relative">
    <div className="marquee-container">
      <div className="marquee-content font-mono text-sm uppercase tracking-widest">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-8 flex items-center gap-4">
            <img 
              src="/images/no_bg.png" 
              alt="Logo" 
              className="w-[40px] h-[40px]" 
            />
            ETHMumbai 2026 
            <span className="text-gray-500">•</span> 
            Build For The World 
            <span className="text-gray-500">•</span> 
            Hack The Future
          </span>
        ))}
      </div>
    </div>
  </div>
);

const Navbar = () => (
  <nav className="w-full p-6 flex items-center max-w-7xl mx-auto text-white relative z-20">
    <div className="flex items-center gap-3">
      {/* Main Logo */}
      <img src="/images/logo.png" alt="ETHMumbai Logo" className="h-24 w-auto object-contain drop-shadow-md" />
    </div>
  </nav>
);

// --- HELPER: ADD WATERMARK (FIXED DIMENSIONS) ---
const addWatermark = (base64Image: string): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const mainImg = new Image();
        const logoImg = new Image();

        // 1. Enforce High-Res Square Canvas
        const size = 2048;
        canvas.width = size;
        canvas.height = size;

        mainImg.onload = () => {
            if (!ctx) return;

            // --- FIX: OBJECT COVER LOGIC ---
            // This prevents "squashing" or "losing dimension" if source isn't perfectly square
            const aspect = mainImg.width / mainImg.height;
            let drawWidth = size;
            let drawHeight = size;
            let offsetX = 0;
            let offsetY = 0;

            if (aspect > 1) {
                // Image is wider (Landscape) -> Crop width
                drawWidth = size * aspect;
                offsetX = (size - drawWidth) / 2;
            } else if (aspect < 1) {
                // Image is taller (Portrait) -> Crop height
                drawHeight = size / aspect;
                offsetY = (size - drawHeight) / 2;
            }

            // Draw image centered with correct proportions
            ctx.drawImage(mainImg, offsetX, offsetY, drawWidth, drawHeight);

            // 2. Add Watermark
            logoImg.onload = () => {
                const logoWidth = size * 0.25; // 25% of width
                const scale = logoWidth / logoImg.width;
                const logoHeight = logoImg.height * scale;
                const padding = 50; 

                // Draw Logo Top-Left
                ctx.drawImage(logoImg, padding, padding, logoWidth, logoHeight);

                // Return high-quality JPEG
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            
            logoImg.onerror = () => {
                // Fallback: return watermark-less image if logo fails
                resolve(`data:image/jpeg;base64,${base64Image}`);
            };

            logoImg.src = '/images/neg_logo.png';
        };

        mainImg.src = `data:image/jpeg;base64,${base64Image}`;
    });
};

// --- MAIN APPLICATION ---

export default function ETHMumbaiApp() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parallax Effect Logic
  const handleMouseMove = (e: MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20; 
    const y = (e.clientY / window.innerHeight - 0.5) * 10; 
    setMousePos({ x, y });
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) return alert("File too large (Max 5MB)");
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
        setGeneratedImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `ETHMumbai_Avatar_${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
        const base64Image = image.split(',')[1];
        
        const prompt = `EXTREME STRICT TEMPLATE — ZERO DEVIATION  
This pipeline produces a square 1:1 avatar with a scattered Mumbai doodle background.  
No creativity. No artistic freedom. No rearrangement of subject.  
Only structured, rule-bound output.

==============================
SUBJECT RULES (HIGHEST PRIORITY)
==============================
- FACE MUST MATCH the user's original facial geometry EXACTLY.
- No beautification, no slimming, no enhancements.
- Convert features into flat vector shapes ONLY.
- Hair silhouette must match EXACTLY with no added spikes.
- Glasses must be identical if present. Do NOT add glasses.
- Clothing shape, sleeve length, stripes, colors must be identical.
- No added accessories.
- Style: Memphis/esports vector avatar with solid colors and bold outlines.
- NO gradients, NO shadows.
- Pose: Chest-up, centered, neutral.

==============================
CANVAS & OUTPUT RULES
==============================
- Aspect ratio: **1:1 exactly**
- Resolution: **2048 × 2048**
- Output: **1 variation ONLY**
- Full background color: **Vibrant Red (#e82024)**

==============================
BACKGROUND STYLE
==============================
- ALL background elements must be **white chalk-line doodles ONLY**.
- NO fill colors. NO shadows. NO gradients.
- Style: loose, hand-drawn, fun, energetic.
- Doodles MUST be **spread ACROSS THE ENTIRE CANVAS**, not clustered.
- The subject MUST remain centered, and doodles must avoid covering the face.

==============================
MANDATORY DOODLE ELEMENTS  
(But SCATTERED randomly across the whole background)
==============================
Include ALL of these, but distribute them widely:
- Bandra–Worli Sea Link
- Gateway of India  
- CST clock tower  
- Marine Drive palm trees  
- Kaali Peeli taxi  
- Auto rickshaw  
- Double-decker BEST bus  
- Mumbai local train
- Vada pav doodle  
- Cutting chai cup  
- Dabbawala crate  

RULES FOR DOODLES:
- They MUST be **spread evenly**
`;

        const payload = {
            contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64Image } }] }],
            generationConfig: { responseModalities: ["image"], temperature: 0.4 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const imgData = data.candidates?.[0]?.content?.parts?.find((p:any) => p.inlineData)?.inlineData?.data;
        
        if (imgData) {
            // --- PROCESS WATERMARK WITH FIX ---
            const watermarked = await addWatermark(imgData);
            setGeneratedImage(watermarked);
        } else {
            alert("Could not generate image. Please try again. (Check API Key)");
        }
    } catch (e) {
        console.error(e);
        alert("Error connecting to generation API");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#e82024] text-[#1A1A1A] overflow-hidden" onMouseMove={handleMouseMove}>
      <Styles />
      <Marquee />
      <Navbar />

      {/* --- ANIMATED BACKGROUND ELEMENTS (Parallax) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        
        <div 
          className="absolute top-32 right-[10%] w-32 h-32 bg-[#FFD233] rounded-full border-4 border-black opacity-90 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] transition-transform duration-100 ease-out"
          style={{ transform: `translate(${-mousePos.x * 2}px, ${-mousePos.y * 2}px)` }}
        ></div>

        {/* CLOUDS */}
        <div className="absolute top-28 left-[5%] cloud-anim opacity-90 z-0" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-32 md:w-48 opacity-90" />
        </div>
        
        <div className="absolute top-52 right-[15%] cloud-anim opacity-80 delay-700 z-0" style={{ transform: `translate(${mousePos.x * 1.5}px, ${mousePos.y}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-24 md:w-36 opacity-80" />
        </div>

        <div className="absolute top-10 left-[25%] cloud-anim-slow opacity-70 z-0" style={{ transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.5}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-40 md:w-56 opacity-70" />
        </div>

        <div className="absolute top-16 right-[35%] cloud-anim-reverse opacity-60 delay-300 z-0" style={{ transform: `translate(${-mousePos.x}px, ${mousePos.y * 0.7}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-28 md:w-40 opacity-60" />
        </div>

        <div className="absolute top-64 left-[-5%] cloud-anim opacity-50 delay-500 z-0" style={{ transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 1.2}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-20 md:w-32 opacity-50" />
        </div>
        
        <div className="absolute top-44 right-[5%] cloud-anim-reverse opacity-40 delay-200 z-0" style={{ transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.8}px)` }}>
           <img src="/images/cloud.png" alt="Cloud" className="w-36 md:w-48 opacity-40" />
        </div>

        {/* BOTTOM SECTION */}
        <div 
            className="absolute bottom-0 left-0 w-full z-0 flex items-end"
            style={{ 
                transform: `translateY(calc(55% + ${mousePos.y * 0.05}px))`,
                transition: 'transform 0.1s ease-out',
                height: '85vh',
                pointerEvents: 'none'
            }}
        >
            <img 
                src="/images/bottom.png" 
                alt="Mumbai Skyline" 
                className="w-full h-full object-cover object-bottom opacity-20 mix-blend-screen" 
            />
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-8">
        
        {/* LEFT: TEXT & ILLUSTRATION */}
        <div className="text-center md:text-left text-white max-w-lg">
          <div className="inline-flex items-center gap-2 bg-[#FFD233] text-black px-4 py-1 rounded-full font-bold text-sm mb-6 border-2 border-black hard-shadow">
            <Ticket size={16} /> OFFICIAL TICKET BOOTH
          </div>
          <h1 className="text-6xl md:text-8xl font-logo font-bold leading-[0.9] mb-6 shadow-black drop-shadow-lg">
            GET YOUR <br/><span className="text-[#FFD233]">AVATAR</span>
          </h1>
          <p className="text-xl md:text-2xl font-medium opacity-90 mb-8 leading-snug">
            Board the bus to Web3! Upload your photo to mint your personalized ETHMumbai Avatar.
          </p>
          
          {/* UPDATED BUS IMAGE SECTION */}
          <div className="hidden md:block mx-auto md:mx-0 bus-body">
             <img 
               src="/images/bus.png" 
               alt="ETH Mumbai Bus" 
               className="w-80 h-auto object-contain drop-shadow-[8px_8px_0px_rgba(0,0,0,0.3)]"
               // Added transform to flip the image horizontally
               style={{ transform: 'scaleX(-1)' }}
             />
          </div>

        </div>

        {/* RIGHT: INTERACTIVE CARD */}
        <div className="relative w-full max-w-md">
            
            <div className="bg-[#FFF8F3] rounded-3xl border-4 border-black p-2 shadow-[12px_12px_0px_rgba(0,0,0,0.3)] relative">
                
                <div className="absolute top-4 left-4 w-3 h-3 bg-[#D1D5DB] rounded-full border-2 border-black flex items-center justify-center"><div className="w-full h-0.5 bg-black rotate-45"></div></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-[#D1D5DB] rounded-full border-2 border-black flex items-center justify-center"><div className="w-full h-0.5 bg-black rotate-45"></div></div>

                <div className="bg-white rounded-2xl border-2 border-black overflow-hidden p-6 flex flex-col items-center">
                    
                    <div className="w-full flex justify-between items-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                        <span className="font-bold text-gray-400">TICKET MACHINE #01</span>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>

                    {!generatedImage ? (
                        <div className="w-full space-y-6">
                            {!image ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-64 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all group"
                                >
                                    <div className="w-16 h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform hard-shadow">
                                        <Upload size={24} className="text-black" />
                                    </div>
                                    <span className="font-bold text-lg text-gray-600">Upload Photo</span>
                                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
                                </div>
                            ) : (
                                <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-black">
                                    <img src={image} className="w-full h-full object-cover" />
                                    <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-1 hover:bg-red-100">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <button 
                                onClick={handleGenerate}
                                disabled={!image || loading}
                                className={`w-full py-4 rounded-xl font-bold text-xl border-2 border-black hard-shadow flex items-center justify-center gap-2
                                    ${!image ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#e82024] text-white hover:bg-[#d11d21]'}`}
                            >
                                {loading ? (
                                    <>Processing <span className="animate-spin">⏳</span></>
                                ) : (
                                    <>GENERATE PASS <Zap size={20} fill="currentColor" /></>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center ticket-reveal">
                            <div className="relative bg-white w-full rounded-xl border-2 border-black overflow-hidden shadow-lg">
                                <div className="bg-[#1A1A1A] text-white p-3 flex justify-between items-center">
                                    <span className="font-mono text-xs text-[#FFD233]">OFFICIAL AVATAR</span>
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ETHMumbai" className="w-8 h-8 bg-white p-0.5" />
                                </div>
                                
                                <div className="p-4 bg-[#FFF8F3]">
                                    <div className="aspect-square w-full border-2 border-black rounded-lg overflow-hidden relative">
                                        <img src={generatedImage} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="p-4 border-t-2 border-dashed border-gray-300">
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-blue-100 border border-blue-300 rounded p-2 text-center">
                                            <span className="block text-[10px] text-gray-500 uppercase">CHAIN</span>
                                            <span className="font-bold text-sm">ETH</span>
                                        </div>
                                        <div className="flex-1 bg-yellow-100 border border-yellow-300 rounded p-2 text-center">
                                            <span className="block text-[10px] text-gray-500 uppercase">Dest.</span>
                                            <span className="font-bold text-sm">Mumbai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full mt-6">
                                <button 
                                    onClick={handleDownload} 
                                    className="flex-1 py-3 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 hard-shadow flex justify-center items-center gap-2"
                                >
                                    <Download size={18} /> Save
                                </button>
                                <button 
                                    onClick={() => setGeneratedImage(null)}
                                    className="px-4 py-3 bg-[#1A1A1A] text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 hard-shadow"
                                >
                                    New
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute -z-10 -top-8 -right-8 w-24 h-24 bg-[#3B82F6] rounded-full border-4 border-black hard-shadow hidden md:block animate-bounce"></div>
        </div>
      </main>
    </div>
  );
}