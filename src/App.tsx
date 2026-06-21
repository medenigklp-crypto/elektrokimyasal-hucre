import { useState, useEffect, useRef } from "react";

const ELEMENTS = [
  { name: "Lityum (Li)", symbol: "Li", ion: "Li⁺", charge: 1, E0_red: -3.04, color: "#a78bfa" },
  { name: "Potasyum (K)", symbol: "K", ion: "K⁺", charge: 1, E0_red: -2.93, color: "#818cf8" },
  { name: "Kalsiyum (Ca)", symbol: "Ca", ion: "Ca²⁺", charge: 2, E0_red: -2.87, color: "#60a5fa" },
  { name: "Sodyum (Na)", symbol: "Na", ion: "Na⁺", charge: 1, E0_red: -2.71, color: "#34d399" },
  { name: "Magnezyum (Mg)", symbol: "Mg", ion: "Mg²⁺", charge: 2, E0_red: -2.37, color: "#6ee7b7" },
  { name: "Alüminyum (Al)", symbol: "Al", ion: "Al³⁺", charge: 3, E0_red: -1.66, color: "#fcd34d" },
  { name: "Çinko (Zn)", symbol: "Zn", ion: "Zn²⁺", charge: 2, E0_red: -0.76, color: "#94a3b8" },
  { name: "Demir (Fe)", symbol: "Fe", ion: "Fe²⁺", charge: 2, E0_red: -0.44, color: "#b45309" },
  { name: "Kurşun (Pb)", symbol: "Pb", ion: "Pb²⁺", charge: 2, E0_red: -0.13, color: "#9ca3af" },
  { name: "Hidrojen (H₂)", symbol: "H₂", ion: "H⁺", charge: 1, E0_red: 0.00, color: "#e2e8f0" },
  { name: "Bakır (Cu)", symbol: "Cu", ion: "Cu²⁺", charge: 2, E0_red: 0.34, color: "#f97316" },
  { name: "Gümüş (Ag)", symbol: "Ag", ion: "Ag⁺", charge: 1, E0_red: 0.80, color: "#e2e8f0" },
  { name: "Altın (Au)", symbol: "Au", ion: "Au³⁺", charge: 3, E0_red: 1.50, color: "#fbbf24" },
];

type Element = typeof ELEMENTS[0];

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function nernst(E0: number, n: number, Q: number, T: number): number {
  if (Q <= 0) return E0;
  const R = 8.314;
  const F = 96485;
  const TK = T + 273.15;
  return E0 - (R * TK / (n * F)) * Math.log(Q);
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function realConc(baseConc: number, waterAdded: number, waterEvap: number): number {
  return (baseConc * 0.1) / (Math.max(10, 100 + waterAdded - waterEvap) / 1000);
}

interface CellDiagramProps {
  leftEl: Element; rightEl: Element;
  leftConc: number; rightConc: number;
  E_pil: number; isConcentration: boolean;
}

function CellDiagram({ leftEl, rightEl, leftConc, rightConc, E_pil, isConcentration }: CellDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);
  const anot = !isConcentration
    ? (leftEl.E0_red <= rightEl.E0_red ? "left" : "right")
    : (leftConc <= rightConc ? "left" : "right");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;

    function spawnElectron() {
      return { type: "electron", progress: 0, speed: 0.004 + Math.random() * 0.003, from: anot };
    }
    function spawnIon() {
      const dir = Math.random() > 0.5 ? "left" : "right";
      return { type: "ion", dir, y: 190 + Math.random() * 30, progress: dir === "left" ? 1 : 0, speed: 0.003 + Math.random() * 0.002, positive: dir !== "left" };
    }

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 5; i++) particlesRef.current.push({ ...spawnElectron(), progress: i / 5 });
      for (let i = 0; i < 4; i++) particlesRef.current.push(spawnIon());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#334155"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(60,100); ctx.lineTo(50,320); ctx.lineTo(200,320); ctx.lineTo(190,100); ctx.stroke();
      ctx.fillStyle = leftEl.color + "55"; ctx.fillRect(51,180,148,139);
      ctx.beginPath(); ctx.moveTo(310,100); ctx.lineTo(300,320); ctx.lineTo(450,320); ctx.lineTo(440,100); ctx.stroke();
      ctx.fillStyle = rightEl.color + "55"; ctx.fillRect(301,180,148,139);

      ctx.strokeStyle = "#475569"; ctx.lineWidth = 8; ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(160, 290); ctx.lineTo(160, 170);
      ctx.arc(250, 170, 90, Math.PI, 0, false);
      ctx.lineTo(340, 290); ctx.stroke();
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(168, 290); ctx.lineTo(168, 175);
      ctx.arc(250, 175, 82, Math.PI, 0, false);
      ctx.lineTo(332, 290); ctx.stroke();
      ctx.fillStyle = "#94a3b8"; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("TUZ KÖPRÜSÜ", 250, 155);

      ctx.strokeStyle = leftEl.color; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(115,130); ctx.lineTo(115,300); ctx.stroke();
      ctx.strokeStyle = rightEl.color;
      ctx.beginPath(); ctx.moveTo(385,130); ctx.lineTo(385,300); ctx.stroke();
      ctx.strokeStyle = "#64748b"; ctx.lineWidth = 2.5; ctx.lineCap = "square";
      ctx.beginPath(); ctx.moveTo(115,65); ctx.lineTo(115,130); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(385,65); ctx.lineTo(385,130); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(115,65); ctx.lineTo(210,65); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(290,65); ctx.lineTo(385,65); ctx.stroke();

      ctx.fillStyle = "#1e293b"; ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(250,65,38,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#38bdf8"; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillText("V", 250, 58);
      ctx.font = "bold 12px monospace";
      ctx.fillStyle = E_pil > 0 ? "#4ade80" : E_pil < 0 ? "#f87171" : "#fbbf24";
      ctx.fillText((E_pil >= 0 ? "+" : "") + E_pil.toFixed(3) + "V", 250, 78);

      ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
      ctx.fillStyle = anot === "left" ? "#f87171" : "#4ade80";
      ctx.fillText(anot === "left" ? "ANOT(−)" : "KATOT(+)", 120, 95);
      ctx.fillStyle = anot === "right" ? "#f87171" : "#4ade80";
      ctx.fillText(anot === "right" ? "ANOT(−)" : "KATOT(+)", 380, 95);

      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = leftEl.color; ctx.fillText(leftEl.symbol, 115, 320);
      ctx.fillStyle = rightEl.color; ctx.fillText(rightEl.symbol, 385, 320);
      ctx.font = "10px monospace"; ctx.fillStyle = "#94a3b8";
      ctx.fillText("["+leftEl.ion+"]="+leftConc.toFixed(3)+"M", 120, 340);
      ctx.fillText("["+rightEl.ion+"]="+rightConc.toFixed(3)+"M", 380, 340);

      const toRemove: number[] = [];
      particlesRef.current.forEach((p, i) => {
        p.progress += p.speed;
        if (p.type === "electron") {
          const fromX = p.from === "left" ? 115 : 385;
          const toX = p.from === "left" ? 385 : 115;
          const x = fromX + (toX - fromX) * clamp(p.progress, 0, 1);
          ctx.beginPath(); ctx.arc(x, 65, 5, 0, Math.PI*2);
          ctx.fillStyle = "#facc15"; ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 7px sans-serif"; ctx.textAlign = "center";
          ctx.fillText("e⁻", x, 68);
        } else {
          const t = p.dir === "left" ? 1 - p.progress : p.progress;
          const x = 200 + 100 * t;
          ctx.beginPath(); ctx.arc(x, p.y, 4, 0, Math.PI*2);
          ctx.fillStyle = p.positive ? "#38bdf8" : "#f87171"; ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = "bold 6px sans-serif"; ctx.textAlign = "center";
          ctx.fillText(p.positive ? "+" : "−", x, p.y + 2);
        }
        if (p.progress > 1) toRemove.push(i);
      });
      toRemove.reverse().forEach(i => particlesRef.current.splice(i, 1));
      if (Math.random() < 0.04) particlesRef.current.push(spawnElectron());
      if (Math.random() < 0.03) particlesRef.current.push(spawnIon());
    }

    function animate() { draw(); animRef.current = requestAnimationFrame(animate); }
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [leftEl, rightEl, leftConc, rightConc, E_pil, anot]);

  return <canvas ref={canvasRef} width={500} height={360} style={{ width: "100%", maxWidth: 500, borderRadius: 12, border: "1px solid #1e293b" }} />;
}

interface SliderProps {
  label: string; value: number; min: number; max: number;
  step: number; onChange: (v: number) => void; unit: string; color?: string;
}

function Slider({ label, value, min, max, step, onChange, unit, color }: SliderProps) {
  const [inputVal, setInputVal] = useState(value.toString());
  useEffect(() => { setInputVal(value.toFixed(step < 0.1 ? 3 : 0)); }, [value, step]);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input type="number" min={min} max={max} step={step} value={inputVal}
            onChange={e => {
              setInputVal(e.target.value);
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= min && v <= max) onChange(v);
            }}
            style={{ width: 72, background: "#0f172a", color: color || "#e2e8f0", border: `1px solid ${color || "#334155"}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, fontFamily: "monospace", fontWeight: 700, textAlign: "right" }} />
          <span style={{ fontSize: 11, color: "#64748b" }}>{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color || "#3b82f6" }} />
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState("different");
  const [temp, setTemp] = useState(25);
  const [leftIdx, setLeftIdx] = useState(6);
  const [rightIdx, setRightIdx] = useState(10);
  const [lC, setLC] = useState(1.0); const [rC, setRC] = useState(1.0);
  const [lW, setLW] = useState(0); const [rW, setRW] = useState(0);
  const [lE, setLE] = useState(0); const [rE, setRE] = useState(0);
  const [concIdx, setConcIdx] = useState(6);
  const [c1, setC1] = useState(0.5); const [c2, setC2] = useState(1.0);
  const [w1, setW1] = useState(0); const [w2, setW2] = useState(0);
  const [e1, setE1] = useState(0); const [e2, setE2] = useState(0);

  const leftEl = ELEMENTS[leftIdx], rightEl = ELEMENTS[rightIdx], concEl = ELEMENTS[concIdx];

  const lCR = mode === "different" ? realConc(lC, lW, lE) : realConc(c1, w1, e1);
  const rCR = mode === "different" ? realConc(rC, rW, rE) : realConc(c2, w2, e2);

  let E_pil: number, Q: number, n: number, E0: number;

  if (mode === "different") {
    const isLeftAnode = leftEl.E0_red <= rightEl.E0_red;
    const aEl = isLeftAnode ? leftEl : rightEl;
    const cEl = isLeftAnode ? rightEl : leftEl;
    const aC = isLeftAnode ? lCR : rCR;
    const cC = isLeftAnode ? rCR : lCR;
    n = (aEl.charge * cEl.charge) / gcd(aEl.charge, cEl.charge);
    E0 = cEl.E0_red - aEl.E0_red;
    Q = Math.pow(aC, cEl.charge) / Math.pow(cC, aEl.charge);
    E_pil = nernst(E0, n, Q, temp);
  } else {
    n = concEl.charge;
    E0 = 0;
    Q = lCR > 0 && rCR > 0 ? Math.min(lCR, rCR) / Math.max(lCR, rCR) : 1;
    E_pil = nernst(E0, n, Q, temp);
  }

  const eColor = E_pil > 0.001 ? "#4ade80" : E_pil < -0.001 ? "#f87171" : "#fbbf24";
  const eStatus = E_pil > 0.001 ? "İSTEMLİ ✓" : E_pil < -0.001 ? "İSTEMSİZ ✗" : "DENGE ≈";
  const leftIsAnode = mode === "different" && leftEl.E0_red <= rightEl.E0_red;

  const graphData = Array.from({ length: 21 }, (_, i) => {
    const t = i * 5;
    const e = nernst(E0, n, Q, t);
    return { t, e };
  });

  const allE = graphData.map(d => d.e);
  const minE = Math.min(...allE);
  const maxE = Math.max(...allE);
  const rangeE = maxE - minE || 0.01;

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "Inter,sans-serif", paddingBottom: 40 }}>
      <div style={{ background: "linear-gradient(135deg,#1e3a5f,#0f172a)", borderBottom: "1px solid #1e293b", padding: "20px 16px" }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>⚡ Elektrokimyasal Hücre Simülatörü</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Elektrot seçin, derişim, sıcaklık ve su etkisini gözlemleyin</p>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[["different","🔋 Farklı Elektrotlar"],["concentration","💧 Derişim Pili"]].map(([m,label]) => (
            <button key={m} onClick={() => setMode(m)} style={{ flex:1, padding:"10px 0", borderRadius:8, border:"none", cursor:"pointer", fontWeight:700, fontSize:13, background: mode===m?"#3b82f6":"#1e293b", color: mode===m?"#fff":"#94a3b8" }}>{label}</button>
          ))}
        </div>

        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <CellDiagram leftEl={mode==="different"?leftEl:concEl} rightEl={mode==="different"?rightEl:concEl} leftConc={lCR} rightConc={rCR} E_pil={E_pil} isConcentration={mode==="concentration"} />
        </div>

        <div style={{ background:"#1e293b", borderRadius:12, padding:"16px 20px", marginBottom:16, border:`1px solid ${eColor}33` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:12, color:"#64748b" }}>Pil Potansiyeli</div>
              <div style={{ fontSize:32, fontWeight:900, color:eColor, fontFamily:"monospace" }}>{E_pil>=0?"+":""}{E_pil.toFixed(4)} V</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:14, fontWeight:700, color:eColor, background:eColor+"22", borderRadius:6, padding:"4px 10px" }}>{eStatus}</div>
              <div style={{ fontSize:11, color:"#64748b", marginTop:6 }}>n={n} | Q={Q.toFixed(4)}</div>
            </div>
          </div>
          <div style={{ marginTop:10, padding:"8px 10px", background:"#0f172a", borderRadius:8, fontSize:11, color:"#64748b", fontFamily:"monospace" }}>
            E = {E0.toFixed(4)} − (RT/nF)·ln({Q.toFixed(4)}) = {E_pil.toFixed(4)}V @ {temp}°C
          </div>
        </div>

        {/* Sıcaklık */}
        <div style={{ background:"#1e293b", borderRadius:12, padding:14, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#f59e0b", marginBottom:8 }}>🌡️ Sıcaklık</div>
          <Slider label="Sıcaklık" value={temp} min={0} max={100} step={1} onChange={setTemp} unit=" °C" color="#f59e0b" />
          <div style={{ fontSize:11, color:"#64748b" }}>T = {temp}°C = {(temp+273.15).toFixed(2)} K</div>
        </div>

        {/* Yarı tepkimeler */}
        <div style={{ background:"#1e293b", borderRadius:12, padding:14, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>⚗️ Yarı Tepkimeler</div>
          {mode === "different" ? (
            <div>
              <div style={{ fontSize:11, color:"#f87171", fontFamily:"monospace", marginBottom:4 }}>
                ANOT: {leftIsAnode?leftEl.symbol:rightEl.symbol}(k) → {leftIsAnode?leftEl.ion:rightEl.ion}(suda) + {leftIsAnode?leftEl.charge:rightEl.charge}e⁻
              </div>
              <div style={{ fontSize:11, color:"#4ade80", fontFamily:"monospace", marginBottom:4 }}>
                KATOT: {leftIsAnode?rightEl.ion:leftEl.ion}(suda) + {leftIsAnode?rightEl.charge:leftEl.charge}e⁻ → {leftIsAnode?rightEl.symbol:leftEl.symbol}(k)
              </div>
              <div style={{ fontSize:11, color:"#e2e8f0", fontFamily:"monospace", borderTop:"1px solid #334155", paddingTop:4, marginTop:4 }}>
                NET: {leftIsAnode?leftEl.symbol:rightEl.symbol} + {leftIsAnode?rightEl.ion:leftEl.ion} ⇌ {leftIsAnode?leftEl.ion:rightEl.ion} + {leftIsAnode?rightEl.symbol:leftEl.symbol}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize:11, color:"#f87171", fontFamily:"monospace", marginBottom:4 }}>
                ANOT: {concEl.symbol}(k) → {concEl.ion}({Math.min(lCR,rCR).toFixed(3)}M) + {concEl.charge}e⁻
              </div>
              <div style={{ fontSize:11, color:"#4ade80", fontFamily:"monospace" }}>
                KATOT: {concEl.ion}({Math.max(lCR,rCR).toFixed(3)}M) + {concEl.charge}e⁻ → {concEl.symbol}(k)
              </div>
            </div>
          )}
        </div>

        {/* Grafik */}
        <div style={{ background:"#1e293b", borderRadius:12, padding:14, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#94a3b8", marginBottom:8 }}>📈 E_pil vs Sıcaklık (0–100°C)</div>
          <svg width="100%" viewBox="0 0 380 130" style={{ overflow:"visible" }}>
            <line x1="40" y1="10" x2="40" y2="105" stroke="#334155" strokeWidth="1"/>
            <line x1="40" y1="105" x2="375" y2="105" stroke="#334155" strokeWidth="1"/>
            {[0,25,50,75,100].map(t => (
              <text key={t} x={40 + t * 3.35} y="117" fill="#475569" fontSize="8" textAnchor="middle">{t}°C</text>
            ))}
            <text key="minE" x="8" y="108" fill="#475569" fontSize="7" textAnchor="middle">{minE.toFixed(2)}</text>
            <text key="maxE" x="8" y="14" fill="#475569" fontSize="7" textAnchor="middle">{maxE.toFixed(2)}</text>
            <polyline
              points={graphData.map(d => `${40 + d.t * 3.35},${105 - ((d.e - minE) / rangeE) * 90}`).join(" ")}
              fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinejoin="round"/>
            {graphData.map((d, i) => (
              <circle key={i}
                cx={40 + d.t * 3.35}
                cy={105 - ((d.e - minE) / rangeE) * 90}
                r={Math.abs(d.t - temp) < 3 ? 6 : 2.5}
                fill={Math.abs(d.t - temp) < 3 ? "#fbbf24" : "#38bdf8"}/>
            ))}
          </svg>
          <div style={{ fontSize:11, color:"#64748b", textAlign:"center" }}>🟡 = {temp}°C → E = {E_pil.toFixed(4)}V</div>
        </div>

        {mode === "different" ? (
          <div>
            <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr", marginBottom:12 }}>
              {[
                [leftIdx, setLeftIdx, lC, setLC, lW, setLW, lE, setLE, lCR, leftEl, "Sol"],
                [rightIdx, setRightIdx, rC, setRC, rW, setRW, rE, setRE, rCR, rightEl, "Sağ"]
              ].map(([idx, setIdx, conc, setConc, water, setWater, evap, setEvap, real, el, label]: any) => (
                <div key={label} style={{ background:"#0f172a", borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>{label} Elektrot</div>
                  <select value={idx} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIdx(parseInt(e.target.value))}
                    style={{ width:"100%", background:"#1e293b", color:"#e2e8f0", border:"1px solid #334155", borderRadius:6, padding:"6px 4px", fontSize:11, marginBottom:8 }}>
                    {ELEMENTS.map((e,i) => <option key={e.symbol} value={i}>{e.symbol} ({e.E0_red>=0?"+":""}{e.E0_red.toFixed(2)}V)</option>)}
                  </select>
                  <Slider label={`[${el.ion}]₀`} value={conc} min={0.01} max={5} step={0.01} onChange={setConc} unit=" M" color={el.color} />
                  <Slider label="Su İlavesi" value={water} min={0} max={200} step={1} onChange={setWater} unit=" mL" color="#38bdf8" />
                  <Slider label="Buharlaşma" value={evap} min={0} max={90} step={1} onChange={setEvap} unit=" mL" color="#f97316" />
                  <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Gerçek: <span style={{ color:el.color, fontWeight:700 }}>{real.toFixed(4)} M</span></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ background:"#0f172a", borderRadius:10, padding:12, marginBottom:12 }}>
              <div style={{ fontSize:12, color:"#64748b", marginBottom:6 }}>Elektrot (Her iki taraf)</div>
              <select value={concIdx} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setConcIdx(parseInt(e.target.value))}
                style={{ width:"100%", background:"#1e293b", color:"#e2e8f0", border:"1px solid #334155", borderRadius:6, padding:"6px 8px", fontSize:13 }}>
                {ELEMENTS.map((e,i) => <option key={e.symbol} value={i}>{e.name}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr 1fr" }}>
              {[
                [c1, setC1, w1, setW1, e1, setE1, lCR, "I"],
                [c2, setC2, w2, setW2, e2, setE2, rCR, "II"]
              ].map(([conc, setConc, water, setWater, evap, setEvap, real, label]: any) => (
                <div key={label} style={{ background:"#0f172a", borderRadius:10, padding:12 }}>
                  <div style={{ fontSize:12, color:"#64748b", marginBottom:8 }}>Hücre {label}</div>
                  <Slider label={`[${concEl.ion}]₀`} value={conc} min={0.001} max={5} step={0.001} onChange={setConc} unit=" M" color={concEl.color} />
                  <Slider label="Su İlavesi" value={water} min={0} max={200} step={1} onChange={setWater} unit=" mL" color="#38bdf8" />
                  <Slider label="Buharlaşma" value={evap} min={0} max={90} step={1} onChange={setEvap} unit=" mL" color="#f97316" />
                  <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>Gerçek: <span style={{ color:concEl.color, fontWeight:700 }}>{real.toFixed(4)} M</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop:20, background:"#1e293b", borderRadius:12, padding:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:"#64748b", marginBottom:10 }}>STANDART İNDİRGENME POTANSİYELLERİ (25°C)</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
            <thead>
              <tr style={{ color:"#475569" }}>
                <th style={{ textAlign:"left", padding:"4px 6px" }}>Elektrot</th>
                <th style={{ textAlign:"right", padding:"4px 6px" }}>E° (V)</th>
              </tr>
            </thead>
            <tbody>
              {ELEMENTS.map((el,i) => (
                <tr key={el.symbol} style={{ background:(mode==="different"&&(i===leftIdx||i===rightIdx))||(mode==="concentration"&&i===concIdx)?"#1e3a5f":"transparent" }}>
                  <td style={{ padding:"3px 6px", color:el.color, fontWeight:700 }}>{el.symbol}</td>
                  <td style={{ padding:"3px 6px", textAlign:"right", fontFamily:"monospace", fontWeight:700, color:el.E0_red>0?"#4ade80":el.E0_red<0?"#f87171":"#fbbf24" }}>{el.E0_red>=0?"+":""}{el.E0_red.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
