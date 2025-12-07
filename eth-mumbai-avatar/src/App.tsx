import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { 
  Upload, 
  X, 
  Zap, 
  Download, 
  Ticket,
  Maximize2,
  Users,
  User,
  AlertCircle
} from 'lucide-react';

// --- FULL DETAILED PROMPTS ---

const SINGLE_PROMPT = `EXTREME STRICT TEMPLATE — ZERO DEVIATION  
This pipeline produces a square 1:1 avatar of a SINGLE PERSON with a scattered Mumbai doodle background.  
No artistic freedom on subject features.

==============================
CANVAS & OUTPUT RULES
==============================
- Aspect ratio: **1:1 exactly**
- Resolution: **2048 × 2048**
- Output: **1 variation ONLY**
- Full background color: **Vibrant Red (#e82024)**

==============================
SUBJECT RULES (HIGHEST PRIORITY)
==============================
- FACE MUST MATCH the user's original facial geometry EXACTLY.
- Convert features into flat vector shapes ONLY.
- Hair silhouette & glasses must match EXACTLY.
- Clothing shape, colors must be identical to source.
- Style: Memphis/esports vector avatar with solid colors and bold outlines.
- NO gradients, NO shadows.
- Pose: Chest-up, centered, neutral.

==============================
BACKGROUND STYLE
==============================
- ALL background elements must be **white chalk-line doodles ONLY**.
- NO fill colors. NO shadows. NO gradients.
- Style: loose, hand-drawn, fun, energetic.
- Doodles MUST be **spread ACROSS THE ENTIRE CANVAS**, not clustered.
- The subject(s) MUST remain centered, and doodles must avoid covering faces.

==============================
MANDATORY DOODLE ELEMENTS  
(But SCATTERED randomly across the whole background)
==============================
Include ALL of these, but distribute them widely:
- Bandra–Worli Sea Link, Gateway of India, CST clock tower, Marine Drive palm trees, Kaali Peeli taxi, Auto rickshaw, Double-decker BEST bus, Mumbai local train, Vada pav doodle, Cutting chai cup, Dabbawala crate.
RULES FOR DOODLES: They MUST be spread evenly.
`;

const GROUP_PROMPT = `EXTREME STRICT TEMPLATE — GROUP PHOTO — ZERO DEVIATION
This pipeline produces a **WIDE 4:3 LANDSCAPE** illustration of MULTIPLE PEOPLE from the source image with a scattered Mumbai doodle background.

==============================
CANVAS & OUTPUT RULES
==============================
- Aspect ratio: **4:3 LANDSCAPE (Width must be larger than height)**
- Resolution: **2048 × 1536**
- Output: **1 variation ONLY**
- Full background color: **Vibrant Red (#e82024)**

==============================
GROUP SUBJECTS RULES (HIGHEST PRIORITY - CRITICAL)
==============================
- **Identify EVERY SINGLE PERSON in the source image. NO ONE can be left out.**
- Convert ALL distinct faces and clothing into flat Memphis/esports vector art with bold outlines.
- Maintain original facial geometry, hair, glasses, and clothing styles for EACH person identified.
- Pose: Arrange all subjects tightly together, chest-up, fitting within the wide frame. Maintain roughly their relative positions from the photo.
- NO gradients, NO shadows on people. Solid colors only.

==============================
BACKGROUND STYLE
==============================
- ALL background elements must be **white chalk-line doodles ONLY**.
- NO fill colors. NO shadows. NO gradients.
- Style: loose, hand-drawn, fun, energetic.
- Doodles MUST be **spread ACROSS THE ENTIRE CANVAS**, not clustered.
- The subject(s) MUST remain centered, and doodles must avoid covering faces.

==============================
MANDATORY DOODLE ELEMENTS  
(But SCATTERED randomly across the whole background)
==============================
Include ALL of these, but distribute them widely:
- Bandra–Worli Sea Link, Gateway of India, CST clock tower, Marine Drive palm trees, Kaali Peeli taxi, Auto rickshaw, Double-decker BEST bus, Mumbai local train, Vada pav doodle, Cutting chai cup, Dabbawala crate.
RULES FOR DOODLES: They MUST be spread evenly.
`;


// --- CUSTOM STYLES ---
const Styles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=JetBrains+Mono:wght@500&family=Outfit:wght@400;600;800&display=swap');

    :root {
      --eth-red: #e82024;
      --eth-cream: #FFF8F3;
      --eth-yellow: #FFD233;
      --eth-black: #1A1A1A;
    }

    body {
      background-color: var(--eth-red);
      font-family: 'Outfit', sans-serif;
      overflow: hidden; 
    }

    .font-logo { font-family: 'Fredoka', sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    /* ANIMATIONS */
    @keyframes float-cloud {
      0% { transform: translateX(0px); }
      100% { transform: translateX(20px); }
    }
    .cloud-anim { animation: float-cloud 8s ease-in-out infinite alternate; }
    .cloud-anim-2 { animation: float-cloud 10s ease-in-out infinite alternate-reverse; }

    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .marquee-container { display: flex; overflow: hidden; white-space: nowrap; }
    .marquee-content { display: flex; animation: marquee 20s linear infinite; }

    @keyframes print-ticket {
      0% { transform: translateY(-100%); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    .ticket-reveal { animation: print-ticket 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

    .hard-shadow {
      box-shadow: 4px 4px 0px var(--eth-black);
      transition: all 0.2s ease;
    }
    .hard-shadow:active {
      transform: translate(2px, 2px);
      box-shadow: 2px 2px 0px var(--eth-black);
    }
    
    .hard-shadow:disabled {
        box-shadow: none;
        transform: translate(2px, 2px);
    }

    @keyframes bus-drive {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    .bus-body { animation: bus-drive 0.6s infinite ease-in-out; }

    .bg-pattern {
      background-image: radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px);
      background-size: 30px 30px;
    }
    
    @keyframes zoom-in {
        0% { transform: scale(0.9); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
    .modal-zoom { animation: zoom-in 0.2s ease-out forwards; }

    /* --- NEW LOADING ANIMATION: MINTING STRIPES --- */
    @keyframes mint-stripes {
      0% { background-position: 0 0; }
      100% { background-position: 50px 50px; }
    }

    .loading-minting {
        background-color: #FFFFFF !important;
        color: #e82024 !important; /* Red Text */
        border-color: #e82024 !important;
        /* The Slant Red Lines */
        background-image: linear-gradient(
            -45deg, 
            rgba(232, 32, 36, 0.10) 25%, 
            transparent 25%, 
            transparent 50%, 
            rgba(232, 32, 36, 0.10) 50%, 
            rgba(232, 32, 36, 0.10) 75%, 
            transparent 75%, 
            transparent
        ) !important;
        background-size: 50px 50px !important;
        animation: mint-stripes 1s linear infinite !important;
        cursor: wait !important;
        opacity: 1 !important;
        text-shadow: none !important;
        box-shadow: inset 0 0 10px rgba(0,0,0,0.05) !important;
    }
  `}</style>
);

// --- VISUAL COMPONENTS ---

const Marquee = () => (
  <div className="w-full bg-black text-white py-2 overflow-hidden border-y-2 border-black z-50 relative shrink-0">
    <div className="marquee-container">
      <div className="marquee-content font-mono text-xs md:text-sm uppercase tracking-widest">
        {[...Array(10)].map((_, i) => (
          <span key={i} className="mx-4 md:mx-8 flex items-center gap-2 md:gap-4">
            <img src="/images/no_bg.png" alt="Logo" className="w-[24px] h-[24px] md:w-[40px] md:h-[40px]" />
            ETHMumbai 2026 <span className="text-gray-500">•</span> Build For The World
          </span>
        ))}
      </div>
    </div>
  </div>
);

const Navbar = () => (
  <nav className="w-full p-4 md:p-6 flex items-center max-w-7xl mx-auto text-white relative z-20 shrink-0 justify-center md:justify-start">
    <div className="flex items-center gap-3">
      <img src="/images/logo.png" alt="ETHMumbai Logo" className="h-14 md:h-24 w-auto object-contain drop-shadow-md" />
    </div>
  </nav>
);

// --- HELPER: ADD WATERMARK, TEXT, NAME & STAMP ---
const addWatermarkAndText = (base64Image: string, isGroup: boolean, userName: string): Promise<string> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const mainImg = new Image();
        const logoImg = new Image();
        const stampImg = new Image(); 

        // 1. DYNAMIC RESOLUTION
        const width = 2048;
        const height = isGroup ? 1536 : 2048;

        canvas.width = width;
        canvas.height = height;

        const mumbaiPhrases = [
            "NFTs!", "FULL POWER!", "WAGMI", 
            "Kasa Kay!", "Ek Number!", "Bantai!"
        ];

        mainImg.onload = () => {
            if (!ctx) return;

            // 2. Draw Main Image (Crop/Fit Logic)
            const imgAspect = mainImg.width / mainImg.height;
            const canvasAspect = width / height;
            let drawW, drawH, offX, offY;

            if (imgAspect > canvasAspect) {
                drawH = height;
                drawW = height * imgAspect;
                offY = 0;
                offX = (width - drawW) / 2;
            } else {
                drawW = width;
                drawH = width / imgAspect;
                offX = 0;
                offY = (height - drawH) / 2;
            }

            // Fill red first
            ctx.fillStyle = '#e82024';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(mainImg, offX, offY, drawW, drawH);

            // 3. Add Slang Bubbles (ONLY IF GROUP MODE)
            if (isGroup) {
                ctx.font = '900 85px "Outfit", sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.lineWidth = 6;

                const phrase = mumbaiPhrases[Math.floor(Math.random() * mumbaiPhrases.length)];
                
                // Safe corners
                const isLeft = Math.random() > 0.5;
                const bubbleX = isLeft ? width * 0.15 : width * 0.85;
                const bubbleY = height * 0.2; // Top 20%

                const textMetrics = ctx.measureText(phrase.toUpperCase());
                const textWidth = textMetrics.width;
                const paddingX = 60;
                const rectH = 140;
                const rectW = textWidth + paddingX * 2;
                const rectX = bubbleX - rectW / 2;
                const rectY = bubbleY - rectH / 2;

                ctx.save();
                ctx.translate(bubbleX, bubbleY);
                ctx.rotate((Math.random() - 0.5) * 0.2); 
                ctx.translate(-bubbleX, -bubbleY);

                // Shadow
                ctx.fillStyle = '#1A1A1A';
                ctx.fillRect(rectX + 12, rectY + 12, rectW, rectH);

                // Bubble
                ctx.fillStyle = '#FFFFFF';
                ctx.strokeStyle = '#1A1A1A';
                ctx.fillRect(rectX, rectY, rectW, rectH);
                ctx.strokeRect(rectX, rectY, rectW, rectH);
                
                // Tail
                ctx.beginPath();
                if (isLeft) {
                    ctx.moveTo(rectX + rectW - 40, rectY + rectH); 
                    ctx.lineTo(rectX + rectW, rectY + rectH + 30);
                    ctx.lineTo(rectX + rectW - 10, rectY + rectH);
                } else {
                    ctx.moveTo(rectX + 40, rectY + rectH);
                    ctx.lineTo(rectX, rectY + rectH + 30);
                    ctx.lineTo(rectX + 10, rectY + rectH);
                }
                ctx.fill();
                ctx.stroke();

                // Text
                ctx.fillStyle = '#1A1A1A';
                ctx.fillText(phrase.toUpperCase(), bubbleX, bubbleY + 5);
                ctx.restore();
            }

            // 4. Draw Logo (TOP LEFT CORNER)
            logoImg.onload = () => {
                const logoWidth = width * 0.22; 
                const scale = logoWidth / logoImg.width;
                const logoHeight = logoImg.height * scale;
                const padding = 40; 
                
                ctx.drawImage(logoImg, padding, padding, logoWidth, logoHeight);

                // 5. Draw Full Width Name Bar (Bottom)
                if (userName && userName.trim() !== "") {
                    const nameText = userName.toUpperCase();
                    const barHeight = 220; 
                    const barY = height - barHeight;

                    // Draw Full Width White Bar
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, barY, width, barHeight);

                    // Draw Top Border for definition
                    ctx.strokeStyle = '#1A1A1A';
                    ctx.lineWidth = 8;
                    ctx.beginPath();
                    ctx.moveTo(0, barY);
                    ctx.lineTo(width, barY);
                    ctx.stroke();

                    // Text (Red, Centered)
                    ctx.font = '900 130px "Outfit", sans-serif'; 
                    ctx.fillStyle = '#e82024';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(nameText, width / 2, barY + (barHeight / 2) + 5);
                }

                // 6. Draw Stamp Image (TOP RIGHT - BIG & CUT OUT)
                stampImg.onload = () => {
                    // Make it BIG: 45% of canvas width
                    const stampW = width * 0.45; 
                    const stampScale = stampW / stampImg.width;
                    const stampH = stampImg.height * stampScale;
                    
                    const offsetX = stampW * 0.3; 
                    const offsetY = stampH * 0.3; 

                    const drawX = width - stampW + offsetX; 
                    const drawY = -offsetY;

                    ctx.drawImage(stampImg, drawX, drawY, stampW, stampH);
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                };

                // Handle stamp error (resolve anyway)
                stampImg.onerror = () => {
                    console.error("Stamp image not found at /stamp.png");
                    resolve(canvas.toDataURL('image/jpeg', 0.95));
                };
                
                stampImg.src = '/images/stamp.png'; 
            };
            
            logoImg.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.95));
            logoImg.src = '/images/neg_logo.png'; 
        };

        mainImg.src = `data:image/jpeg;base64,${base64Image}`;
    });
};

// CONSTANT FOR CREDITS
const MAX_CREDITS = 3;

export default function ETHMumbaiApp() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [userName, setUserName] = useState<string>(""); 
  const [credits, setCredits] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Credits
  useEffect(() => {
    const storedCredits = localStorage.getItem('eth_mumbai_credits');
    if (storedCredits) {
        setCredits(parseInt(storedCredits));
    } else {
        localStorage.setItem('eth_mumbai_credits', MAX_CREDITS.toString());
        setCredits(MAX_CREDITS);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isModalOpen]);

  const handleMouseMove = (e: MouseEvent) => {
    if (window.innerWidth < 768) return; 
    setMousePos({ 
      x: (e.clientX / window.innerWidth - 0.5) * 15, 
      y: (e.clientY / window.innerHeight - 0.5) * 8 
    });
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
    if (!userName.trim()) {
        alert("Please enter your name!");
        return;
    }
    
    if (credits <= 0) {
        alert("You have used all your free credits!");
        return;
    }

    setLoading(true);
    
    try {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
        const base64Image = image.split(',')[1];
        
        const promptToUse = isGroupMode ? GROUP_PROMPT : SINGLE_PROMPT;

        const payload = {
            contents: [{ parts: [{ text: promptToUse }, { inlineData: { mimeType: "image/jpeg", data: base64Image } }] }],
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
            const finalImage = await addWatermarkAndText(imgData, isGroupMode, userName);
            setGeneratedImage(finalImage);
            
            const newCredits = credits - 1;
            setCredits(newCredits);
            localStorage.setItem('eth_mumbai_credits', newCredits.toString());

        } else {
            console.error(data);
            alert("Could not generate image. Please try again.");
        }
    } catch (e) {
        console.error(e);
        alert("Error connecting to generation API");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col relative bg-[#e82024] text-[#1A1A1A] overflow-y-auto overflow-x-hidden" onMouseMove={handleMouseMove}>
      <Styles />
      <Marquee />
      <Navbar />

      {isModalOpen && generatedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl flex flex-col items-center modal-zoom" 
            onClick={(e) => e.stopPropagation()} 
          >
             <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 z-50 text-white hover:text-[#FFD233] transition-colors p-2 bg-black/50 rounded-full md:bg-transparent"
             >
                <X size={28} strokeWidth={3} />
             </button>
             <img 
                src={generatedImage} 
                alt="Full Generated Avatar" 
                className={`w-full ${isGroupMode ? 'aspect-[4/3]' : 'aspect-square'} max-h-[70vh] object-contain rounded-xl border-4 border-black shadow-[0px_0px_0px_4px_rgba(255,255,255,0.2)] bg-white`} 
             />

             <div className="w-full mt-4 md:mt-6">
                <button 
                    onClick={handleDownload} 
                    className="w-full py-3 md:py-4 bg-[#FFD233] border-4 border-black rounded-xl font-bold text-lg md:text-xl hard-shadow flex justify-center items-center gap-2 hover:bg-[#ffc800]"
                >
                    DOWNLOAD HD <Download size={24} />
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
        <div className="absolute top-28 left-[5%] cloud-anim opacity-60 md:opacity-90 z-0">
           <img src="/images/cloud.png" alt="Cloud" className="w-24 md:w-48" />
        </div>
        <div className="absolute top-16 right-[10%] cloud-anim-2 opacity-50 md:opacity-80 z-0">
           <img src="/images/cloud.png" alt="Cloud" className="w-20 md:w-40" style={{ transform: 'scaleX(-1)' }} />
        </div>
        <div className="absolute bottom-0 left-0 w-full z-0 flex items-end" style={{ transform: `translateY(calc(45% + ${mousePos.y * 0.05}px))`, height: '85vh' }}>
            <img src="/images/bottom.png" className="w-full h-full object-cover object-bottom opacity-15 md:opacity-20 mix-blend-screen" />
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-4 md:py-8 pb-12 md:pb-8">
        
        <div className="text-center md:text-left text-white max-w-lg shrink-0 flex flex-col items-center md:items-start">
          <div className="inline-flex items-center gap-2 bg-[#FFD233] text-black px-3 py-1 md:px-4 rounded-full font-bold text-[10px] md:text-sm mb-3 md:mb-6 border-2 border-black hard-shadow">
            <Ticket size={12} className="md:w-4 md:h-4" /> OFFICIAL TICKET BOOTH
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-logo font-bold leading-[0.9] mb-3 md:mb-6 shadow-black drop-shadow-lg">
            GET YOUR <br/><span className="text-[#FFD233]">AVATAR</span>
          </h1>
          <p className="text-base sm:text-lg md:text-2xl font-medium opacity-90 mb-4 md:mb-8 leading-snug px-4 md:px-0 max-w-sm md:max-w-none">
            Board the bus to Web3! Upload your photo to mint your personalized ETHMumbai Avatar.
          </p>
          <div className="block mx-auto md:mx-0 bus-body mb-4 md:mb-0">
             <img src="/images/bus.png" className="w-32 sm:w-48 md:w-80 h-auto object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]" style={{ transform: 'scaleX(-1)' }} />
          </div>
        </div>

        <div className="relative w-full max-w-[340px] md:max-w-md shrink-0 mb-8 md:mb-0">
            <div className="absolute -z-10 -top-8 -right-8 w-28 h-28 bg-[#FFD233] rounded-full border-4 border-black hard-shadow hidden md:block"></div>
            <div className="absolute -z-20 top-14 -right-12 w-20 h-20 bg-[#3B82F6] rounded-full border-4 border-black hard-shadow hidden md:block"></div>
            <div className="absolute -z-30 -top-2 -right-2 w-10 h-10 bg-[#FFC8DD] rounded-full border-4 border-black hard-shadow hidden md:block"></div>

            <div className="bg-[#FFF8F3] rounded-3xl border-4 border-black p-2 shadow-[8px_8px_0px_rgba(0,0,0,0.3)] relative">
                <div className="absolute top-4 left-4 w-3 h-3 bg-[#D1D5DB] rounded-full border-2 border-black flex items-center justify-center"><div className="w-full h-0.5 bg-black rotate-45"></div></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-[#D1D5DB] rounded-full border-2 border-black flex items-center justify-center"><div className="w-full h-0.5 bg-black rotate-45"></div></div>

                <div className="bg-white rounded-2xl border-2 border-black overflow-hidden p-4 md:p-6 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
                        <span className="font-bold text-gray-400 text-sm md:text-base">TICKET MACHINE #01</span>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded border-2 border-black text-xs font-bold ${credits > 0 ? 'bg-[#FFD233] text-black' : 'bg-red-500 text-white'}`}>
                            <Ticket size={14} />
                            {credits} LEFT
                        </div>
                    </div>

                    {!generatedImage ? (
                        <div className="w-full space-y-4">
                            

                            <div className="flex w-full border-2 border-black rounded-lg overflow-hidden hard-shadow">
                                <button 
                                    onClick={() => setIsGroupMode(false)}
                                    className={`flex-1 py-2 font-bold flex items-center justify-center gap-2 transition-colors ${!isGroupMode ? 'bg-[#FFD233] text-black' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <User size={18} /> SOLO
                                </button>
                                <div className="w-0.5 bg-black"></div>
                                <button 
                                    onClick={() => setIsGroupMode(true)}
                                    className={`flex-1 py-2 font-bold flex items-center justify-center gap-2 transition-colors ${isGroupMode ? 'bg-[#FFD233] text-black' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
                                >
                                    <Users size={18} /> GROUP
                                </button>
                            </div>

                            <input 
                                type="text"
                                placeholder="Enter Your Name..."
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full py-3 px-4 border-2 border-black rounded-lg font-bold text-lg text-center outline-none focus:bg-gray-50 placeholder:text-gray-400"
                            />

                            {!image ? (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-44 md:h-56 bg-gray-50 border-4 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 transition-all group active:scale-95 touch-manipulation"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-white border-2 border-black rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform hard-shadow">
                                        <Upload size={20} className="text-black md:w-6 md:h-6" />
                                    </div>
                                    <span className="font-bold text-sm md:text-lg text-gray-600">
                                        Upload {isGroupMode ? 'Group' : ''} Photo
                                    </span>
                                    <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={(e) => e.target.files && processFile(e.target.files[0])} />
                                </div>
                            ) : (
                                <div className="relative w-full h-44 md:h-56 rounded-xl overflow-hidden border-2 border-black">
                                    <img src={image} className="w-full h-full object-cover" />
                                    <button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-white border-2 border-black rounded-full p-2 hover:bg-red-100 shadow-md z-10 active:scale-90 transition-transform">
                                        <X size={20} />
                                    </button>
                                </div>
                            )}

                            <button 
                                onClick={handleGenerate}
                                disabled={!image || loading || credits <= 0 || !userName.trim()}
                                className={`w-full py-3 md:py-4 rounded-xl font-bold text-lg md:text-xl border-2 border-black hard-shadow flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all touch-manipulation
                                    ${loading 
                                        ? 'loading-minting' 
                                        : (credits <= 0 || !image || !userName.trim())
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed border-gray-500' 
                                            : 'bg-[#e82024] text-white hover:bg-[#d11d21]'
                                    }`}
                            >
                                {loading ? (
                                    <>MINTING TICKET...</>
                                ) : credits <= 0 ? (
                                    <>NO CREDITS LEFT <AlertCircle size={20} /></>
                                ) : (
                                    <>GENERATE {isGroupMode ? 'GROUP' : ''} TICKETS <Zap size={20} fill="currentColor" /></>
                                )}
                            </button>
                            
                            {credits <= 0 && (
                                <p className="text-xs text-red-500 font-bold text-center mt-2">
                                    Limit reached for this device.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col items-center ticket-reveal">
                            <div className="relative bg-white w-full rounded-xl border-2 border-black overflow-hidden shadow-lg">
                                <div className="bg-[#1A1A1A] text-white p-2.5 md:p-3 flex justify-between items-center">
                                    <span className="font-mono text-xs text-[#FFD233]">OFFICIAL AVATAR</span>
                                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ETHMumbai" className="w-6 h-6 md:w-8 md:h-8 bg-white p-0.5" />
                                </div>
                                
                                <div className="p-3 md:p-4 bg-[#FFF8F3]">
                                    <div 
                                        className={`w-full ${isGroupMode ? 'aspect-[4/3]' : 'aspect-square'} border-2 border-black rounded-lg overflow-hidden relative group cursor-pointer active:opacity-90 transition-opacity`}
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <img src={generatedImage} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                                            <Maximize2 className="text-white opacity-0 group-hover:opacity-100 drop-shadow-lg scale-75 group-hover:scale-100 transition-all" size={32} />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 md:p-4 border-t-2 border-dashed border-gray-300">
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-blue-100 border border-blue-300 rounded p-1.5 md:p-2 text-center">
                                            <span className="block text-[10px] text-gray-500 uppercase">CHAIN</span>
                                            <span className="font-bold text-xs md:text-sm">ETH</span>
                                        </div>
                                        <div className="flex-1 bg-yellow-100 border border-yellow-300 rounded p-1.5 md:p-2 text-center">
                                            <span className="block text-[10px] text-gray-500 uppercase">Dest.</span>
                                            <span className="font-bold text-xs md:text-sm">Mumbai</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 w-full mt-4 md:mt-6">
                                <button onClick={handleDownload} className="flex-1 py-3 bg-white border-2 border-black rounded-lg font-bold hover:bg-gray-50 hard-shadow flex justify-center items-center gap-2 active:translate-y-1 active:shadow-none text-sm md:text-base">
                                    <Download size={18} /> Save
                                </button>
                                <button onClick={() => setGeneratedImage(null)} className="px-4 py-3 bg-[#1A1A1A] text-white border-2 border-black rounded-lg font-bold hover:bg-gray-800 hard-shadow active:translate-y-1 active:shadow-none text-sm md:text-base">
                                    New
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}