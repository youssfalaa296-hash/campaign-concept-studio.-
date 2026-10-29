"use client";

import { useState, type FormEvent } from "react";

type Brief = { brand: string; objective: string; audience: string; channel: string; tone: string; offer: string; constraints: string };
const emptyBrief: Brief = { brand: "", objective: "", audience: "", channel: "Social", tone: "Confident", offer: "", constraints: "" };
const objectives = ["Build awareness", "Generate qualified leads", "Drive sales", "Launch something new", "Build community"];

export default function Home() {
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [outline, setOutline] = useState<Brief | null>(null);
  const [error, setError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<{ concept: string; imageDataUrl: string | null; model: string; imageRequested: boolean; imageGenerated: boolean } | null>(null);
  const [generateImage, setGenerateImage] = useState(false);
  const requiredCount = [brief.brand, brief.objective, brief.audience].filter(v => v.trim()).length;
  const progress = Math.round(requiredCount / 3 * 100);
  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief(current => ({ ...current, [key]: value }));
    setError("");
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!brief.brand.trim() || !brief.objective.trim() || !brief.audience.trim()) {
      setError("Add a brand or project, an objective, and an audience to create an outline.");
      return;
    }
    setOutline({ ...brief });
  }
  async function generateAiConcept() {
    if (!outline || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiResult(null);
    try {
      const response = await fetch("/api/concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: outline, generateImage }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Could not generate a concept. Please retry.");
      if (typeof data?.concept !== "string" || !data.concept.trim()) throw new Error("The response was empty. Please retry.");
      setAiResult({ concept: data.concept, imageDataUrl: typeof data.imageDataUrl === "string" ? data.imageDataUrl : null, model: typeof data.model === "string" ? data.model : "configured model", imageRequested: data.imageRequested === true, imageGenerated: data.imageGenerated === true });
    } catch (cause) {
      setAiError(cause instanceof Error ? cause.message : "A network error occurred. Please try again.");
    } finally {
      setAiLoading(false);
    }
  }
  function copyOutline() {
    if (!outline || !navigator.clipboard) return;
    const text = [
      "CAMPAIGN CONCEPT", outline.brand, "",
      "OBJECTIVE: " + outline.objective, "AUDIENCE: " + outline.audience,
      "CHANNEL: " + outline.channel, "TONE: " + outline.tone,
      "OFFER: " + (outline.offer || "Not provided"),
      "CONSTRAINTS: " + (outline.constraints || "Not provided")
    ].join("\n");
    void navigator.clipboard.writeText(text);
  }
  return <main className="shell">
    <aside className="sidebar" aria-label="Main navigation">
      <a className="brand" href="#top"><span className="brand-mark">C<span>.</span></span><span className="brand-name">Campaign<br/>Concept Studio</span></a>
      <div className="side-label">WORKSPACE</div>
      <a className="nav-item active" href="#brief"><span>✳</span> New concept</a>
      <a className="nav-item" href="#method"><span>↗</span> Workflow</a>
      <div className="sidebar-bottom"><span className="status-dot"/><div><strong>Starter workspace</strong><small>No account connected</small></div></div>
    </aside>
    <section className="main-area" id="top">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>New concept</strong></div><span className="local-badge"><i/> Browser-based draft</span></header>
      <div className="content">
        <div className="eyebrow"><i/> CREATIVE STRATEGY WORKSPACE</div>
        <section className="hero"><div className="hero-copy"><h1>Good campaigns<br/>start with <em>clarity.</em></h1><p>Turn a real brief into a focused campaign direction. Start with what you know; leave assumptions out.</p></div><div className="hero-art" aria-hidden="true"><div className="ring ring-one"/><div className="ring ring-two"/><div className="art-core">C<span>↗</span></div><span className="art-tag tag-top">STRATEGY</span><span className="art-tag tag-bottom">IDEA → ACTION</span></div></section>
        <div className="section-heading" id="brief"><div className="section-title"><span className="step">01</span><div><h2>Build your brief</h2><p>A few clear inputs are enough to begin.</p></div></div><div className="completion"><strong>{progress}%</strong><div className="progress"><i style={{width: progress + "%"}}/></div><small>Core details</small></div></div>
        <div className="workspace-grid">
          <form className="brief-card" onSubmit={submit} noValidate>
            <div className="card-top"><div><span className="tiny-label">THE FOUNDATION</span><h3>Campaign essentials</h3></div><span className="required-note">* Required</span></div>
            <label className="field"><span>Brand or project <b>*</b></span><input value={brief.brand} onChange={e=>update("brand",e.target.value)} placeholder="Enter the real brand or project name" maxLength={120}/></label>
            <label className="field"><span>Primary objective <b>*</b></span><select value={brief.objective} onChange={e=>update("objective",e.target.value)}><option value="">Choose one objective</option>{objectives.map(o=><option key={o}>{o}</option>)}</select></label>
            <label className="field"><span>Who is this for? <b>*</b></span><textarea value={brief.audience} onChange={e=>update("audience",e.target.value)} placeholder="Describe the audience you actually want to reach" rows={3} maxLength={700}/><small>Use known audience details. Avoid unsupported assumptions.</small></label>
            <div className="field-row"><label className="field"><span>Main channel</span><select value={brief.channel} onChange={e=>update("channel",e.target.value)}>{["Social","Search","Email","Website","Print","Multi-channel","Not decided"].map(v=><option key={v}>{v}</option>)}</select></label><label className="field"><span>Creative tone</span><select value={brief.tone} onChange={e=>update("tone",e.target.value)}>{["Confident","Playful","Premium","Warm","Direct","Experimental","Not decided"].map(v=><option key={v}>{v}</option>)}</select></label></div>
            <label className="field"><span>Offer, product, or message</span><textarea value={brief.offer} onChange={e=>update("offer",e.target.value)} placeholder="What are you promoting or asking people to understand?" rows={2} maxLength={700}/></label>
            <label className="field"><span>Constraints and proof points</span><textarea value={brief.constraints} onChange={e=>update("constraints",e.target.value)} placeholder="Timing, required wording, verified facts, or restrictions" rows={3} maxLength={1000}/></label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="form-footer"><span>◇ Draft stays in this browser session.</span><button type="submit">Create concept outline <b>↗</b></button></div>
          </form>
          <aside className="right-rail"><section className="guide-card" id="method"><div className="guide-icon">✳</div><span className="tiny-label">A SIMPLE METHOD</span><h3>Clarity before creativity.</h3><p>Build a direction from the facts you provide—not invented market data or unsupported performance claims.</p><ol><li><i>1</i><div><strong>Define</strong><small>Set the objective and audience.</small></div></li><li><i>2</i><div><strong>Focus</strong><small>Clarify the offer and constraints.</small></div></li><li><i>3</i><div><strong>Shape</strong><small>Review a structured outline.</small></div></li></ol></section><section className="note-card"><span className="note-symbol">i</span><div><strong>Evidence-first by design</strong><p>No fabricated results, audience statistics, testimonials, or live integrations are shown in this starter.</p></div></section></aside>
        </div>
        {outline && <section className="output-card" aria-live="polite"><div className="output-head"><div><span className="tiny-label">YOUR WORKING DRAFT</span><h2>{outline.brand}: campaign concept</h2></div><button className="secondary-button" type="button" onClick={()=>{setOutline(null);setAiResult(null);setAiError("");}}>Close outline</button></div><div className="output-grid">
          <div><span>OBJECTIVE</span><p>{outline.objective}</p></div><div><span>CHANNEL</span><p>{outline.channel}</p></div><div><span>TONE</span><p>{outline.tone}</p></div>
          <div className="wide"><span>INTENDED AUDIENCE</span><p>{outline.audience}</p></div>
          <div className="wide"><span>OFFER OR MESSAGE</span><p>{outline.offer.trim() || "Not provided — confirm before finalizing the creative."}</p></div>
          <div className="wide"><span>CONSTRAINTS & PROOF POINTS</span><p>{outline.constraints.trim() || "Not provided — verify facts, timing, and restrictions before publication."}</p></div>
          <div className="wide recommendation"><span>NEXT STEP</span><p>Develop 2–3 creative routes, then validate claims and channel fit against the brief. No external research or performance forecast has been performed by this tool.</p></div>
        </div><div className="ai-controls"><label className="image-option"><input type="checkbox" checked={generateImage} onChange={e=>setGenerateImage(e.target.checked)}/> Include an AI-generated visual (optional)</label><button className="ai-button" type="button" onClick={generateAiConcept} disabled={aiLoading}>{aiLoading ? "Creating your concept…" : "Generate full AI campaign ↗"}</button></div>{aiError && <p className="form-error" role="alert">{aiError}</p>}{aiResult && <section className="ai-result" aria-live="polite"><div className="ai-result-head"><div><span className="tiny-label">AI-GENERATED CREATIVE DIRECTION</span><h3>From brief to campaign</h3></div><span className="model-label">Model: {aiResult.model}</span></div><p className="ai-disclaimer">Review all claims and recommendations before publication. AI output may contain errors and is not market research.</p><div className="ai-copy">{aiResult.concept}</div>{aiResult.imageDataUrl && <figure className="generated-visual"><img src={aiResult.imageDataUrl} alt={"AI-generated campaign visual concept for " + outline.brand}/><figcaption>AI-generated visual draft — review brand, text, rights, and factual details before use.</figcaption></figure>}{aiResult.imageRequested && !aiResult.imageGenerated && <p className="form-hint">Text concept generated, but no image was returned. You can retry with the visual option enabled.</p>}<button className="secondary-button copy-button" type="button" onClick={()=>{void navigator.clipboard?.writeText(aiResult.concept);}}>Copy AI concept ↗</button></section>}<button className="secondary-button copy-button" type="button" onClick={copyOutline}>Copy brief outline ↗</button></section>}
        <footer className="footer"><span>CAMPAIGN CONCEPT STUDIO <i>•</i> INITIAL FOUNDATION</span><span>Clear thinking. No made-up numbers.</span></footer>
      </div>
    </section>
  </main>;
}
