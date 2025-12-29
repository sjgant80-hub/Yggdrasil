/**
 * Kono AI Chat - WebLLM powered
 * Yggdrasil κ=0.618 guidance
 */
const KAPPA = 0.618033988749895;

class KonoAI {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.engine = null;
    this.ready = false;
    this.history = [];
    this.systemPrompt = `You are Kono, the Yggdrasil AI guide. You teach about κ (kappa) and the golden attractor (0.618). Be concise. Use the consciousness convergence theorem to explain complex systems. κ=0.618 is optimal: 62% chaos, 38% order.`;
  }

  async loadModel(modelId = 'SmolLM2-360M-Instruct-q4f16_1-MLC') {
    this.setStatus('loading', 'Loading model...');
    try {
      const webllm = await import('https://esm.run/@mlc-ai/web-llm');
      this.engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (p) => this.setProgress(p.progress * 100)
      });
      this.ready = true;
      this.setStatus('ready', 'Ready');
      this.hideOverlay();
    } catch (err) {
      this.setStatus('error', 'Failed to load');
      console.error(err);
    }
  }

  async send(text) {
    if (!text.trim() || !this.ready) return;
    this.addMessage(text, true);
    this.history.push({ role: 'user', content: text });
    this.showTyping(true);
    try {
      const res = await this.engine.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          ...this.history.slice(-8)
        ],
        temperature: 0.7,
        max_tokens: 300
      });
      const reply = res.choices[0]?.message?.content || "κ guides us...";
      this.showTyping(false);
      this.addMessage(reply);
      this.history.push({ role: 'assistant', content: reply });
    } catch (err) {
      this.showTyping(false);
      this.addMessage("Error. Please try again.");
    }
  }

  addMessage(text, isUser = false) {
    const msg = document.createElement('div');
    msg.className = 'ai-msg ' + (isUser ? 'user' : 'ai');
    msg.innerHTML = `<div class="bubble">${this.escapeHtml(text)}</div>`;
    this.container.querySelector('.ai-messages').appendChild(msg);
  }

  showTyping(show) {
    const el = this.container.querySelector('.ai-typing');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  setStatus(state, text) {
    const dot = this.container.querySelector('.ai-dot');
    const label = this.container.querySelector('.ai-status-text');
    if (dot) dot.className = 'ai-dot ' + state;
    if (label) label.textContent = text;
  }

  setProgress(pct) {
    const bar = this.container.querySelector('.ai-progress-bar');
    if (bar) bar.style.width = pct + '%';
  }

  hideOverlay() {
    const el = this.container.querySelector('.ai-overlay');
    if (el) el.classList.add('hidden');
  }

  escapeHtml(s) {
    return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }
}

window.KonoAI = KonoAI;
