/* @udt Render.Base @t 95 @p null @r [core] */
class RenderBase {
  constructor() {
    this.components = {};
    this.modules = [];
    this.hooks = { pre: [], post: [] };
  }
  use(module) { this.modules.push(module); module.init?.(this); return this; }
  hook(type, fn) { this.hooks[type].push(fn); }
  tpl(t, p = {}) {
    let h = t.replace(/\{\{(\w+)\}\}/g, (_, k) => p[k] ?? '');
    h = h.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, k, c) =>
      (p[k] || []).map(i => this.tpl(c, i)).join(''));
    return h;
  }
  reg(name, comp) { this.components[name] = comp; }
}
window.RenderBase = RenderBase;
