import { Leaf, UtensilsCrossed, ChefHat, Sparkles, Coffee } from 'lucide-react';

export default function Background() {
  return (
    <div className="absolute inset-0 h-screen w-full overflow-hidden -z-10 pointer-events-none bg-[#fdfdfd]">
      
      {/* ═══════════════════════════════════════════════════
          SOFT GLOW BLOBS (Background layer)
      ═══════════════════════════════════════════════════ */}
      {/* Bottom Left Huge Orange Glow */}
      <div style={{
        position: 'absolute', borderRadius: '50%',
        width: '1000px', height: '1000px', bottom: '-400px', left: '-300px',
        background: 'radial-gradient(circle, rgba(253,186,116,0.18) 0%, transparent 60%)',
      }}/>
      
      {/* Right Edge Orange Glow (behind card) */}
      <div style={{
        position: 'absolute', borderRadius: '50%',
        width: '800px', height: '800px', top: '10%', right: '-300px',
        background: 'radial-gradient(circle, rgba(251,146,60,0.12) 0%, transparent 60%)',
      }}/>

      {/* Center Light Blue Glow */}
      <div style={{
        position: 'absolute', borderRadius: '50%',
        width: '600px', height: '600px', top: '20%', left: '30%',
        background: 'radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 60%)',
      }}/>

      {/* Top Left Peach Glow */}
      <div style={{
        position: 'absolute', borderRadius: '50%',
        width: '500px', height: '500px', top: '-200px', left: '-100px',
        background: 'radial-gradient(circle, rgba(254,215,170,0.15) 0%, transparent 60%)',
      }}/>


      {/* ═══════════════════════════════════════════════════
          DOTTED GRIDS
      ═══════════════════════════════════════════════════ */}
      {/* Top Left Dotted Grid */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '400px', height: '400px',
        backgroundImage: 'radial-gradient(rgba(249,115,22,0.2) 2px, transparent 2px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(circle at 10% 10%, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 10% 10%, black, transparent 70%)'
      }} />
      
      {/* Bottom Right Dotted Grid */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, width: '500px', height: '400px',
        backgroundImage: 'radial-gradient(rgba(249,115,22,0.15) 2px, transparent 2px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(circle at 90% 90%, black, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle at 90% 90%, black, transparent 70%)'
      }} />


      {/* ═══════════════════════════════════════════════════
          FLOATING SHAPES
      ═══════════════════════════════════════════════════ */}
      {/* Top Middle-Right 3D Peach Cube */}
      <div style={{
        position: 'absolute', top: '8%', right: '35%',
        width: '100px', height: '100px',
        borderRadius: '24px', transform: 'rotate(25deg)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(254,215,170,0.4) 100%)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        border: '1.5px solid rgba(255,255,255,1)',
        boxShadow: '10px 15px 30px rgba(251,146,60,0.12), inset 1px 1px 10px rgba(255,255,255,0.8)',
      }}/>

      {/* Middle Center Blue 3D Cube */}
      <div style={{
        position: 'absolute', top: '35%', right: '45%',
        width: '120px', height: '120px',
        borderRadius: '30px', transform: 'rotate(-15deg)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(186,230,253,0.5) 100%)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,1)',
        boxShadow: '-8px 12px 30px rgba(56,189,248,0.08), inset 1px 1px 10px rgba(255,255,255,0.8)',
      }}/>

      {/* Top Right Pale Orange Circle (near top edge) */}
      <div style={{
        position: 'absolute', top: '5%', right: '8%',
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,247,237,0.9) 0%, rgba(254,215,170,0.6) 100%)',
        boxShadow: '0 8px 20px rgba(251,146,60,0.1)',
      }}/>

      {/* Far Right Large Pale Peach Circle */}
      <div style={{
        position: 'absolute', top: '38%', right: '1.5%',
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255,247,237,0.95) 0%, rgba(253,186,116,0.5) 100%)',
        boxShadow: '0 10px 25px rgba(251,146,60,0.1)',
      }}/>

      {/* Top Left Small Blue Circle */}
      <div style={{
        position: 'absolute', top: '25%', left: '5%',
        width: '45px', height: '45px', borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(240,249,255,0.95) 0%, rgba(186,230,253,0.6) 100%)',
        boxShadow: '0 8px 20px rgba(56,189,248,0.1)',
      }}/>


      {/* ═══════════════════════════════════════════════════
          RESTAURANT THEMED ICONS & LEAVES
      ═══════════════════════════════════════════════════ */}
      {/* Leaves (Freshness/Ingredients) */}
      <div className="absolute text-green-500/40 drop-shadow-sm" style={{ top: '15%', left: '12%', transform: 'rotate(-20deg)' }}>
        <Leaf className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <div className="absolute text-green-500/30 drop-shadow-sm" style={{ bottom: '40%', right: '4%', transform: 'rotate(70deg)' }}>
        <Leaf className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <div className="absolute text-green-500/35 drop-shadow-sm" style={{ top: '65%', left: '8%', transform: 'rotate(-60deg)' }}>
        <Leaf className="w-7 h-7" strokeWidth={1.5} />
      </div>

      {/* Restaurant Theme Icons */}
      <div className="absolute text-orange-400/30 drop-shadow-sm" style={{ top: '22%', right: '18%', transform: 'rotate(15deg)' }}>
        <UtensilsCrossed className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <div className="absolute text-[#f97316]/20 drop-shadow-sm" style={{ bottom: '25%', left: '25%', transform: 'rotate(-10deg)' }}>
        <ChefHat className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <div className="absolute text-sky-400/30 drop-shadow-sm" style={{ top: '45%', left: '42%', transform: 'rotate(5deg)' }}>
        <Coffee className="w-7 h-7" strokeWidth={1.5} />
      </div>
      
      {/* Sparkles for premium feel */}
      <div className="absolute text-amber-400/40" style={{ top: '12%', right: '40%' }}>
        <Sparkles className="w-6 h-6" strokeWidth={1.5} />
      </div>
      <div className="absolute text-sky-400/40" style={{ bottom: '35%', left: '15%' }}>
        <Sparkles className="w-5 h-5" strokeWidth={1.5} />
      </div>
    </div>
  );
}
