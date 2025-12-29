/* @udt Render.Screen @t 120 @p Render.Base @r [dom] */
const ScreenModule = {
  init(r) {
    r.renderComp = (c) => {
      const def = r.components[c.type];
      if (!def) return `<!-- ${c.type}? -->`;
      let p = { ...c.props };
      if (Array.isArray(p.content)) p.content = p.content.map(x => r.renderComp(x)).join('');
      return r.tpl(def.html, p);
    };
    r.renderDock = (d) => d?.components?.map(c => r.renderComp(c)).join('\n') || d?.html || '';
    r.renderScreen = (scr, el) => {
      r.hooks.pre.forEach(fn => fn(scr));
      el.innerHTML = `<div class="hmi-shell">
        <div class="dock dock-north"><div class="hmi-logo"><span>🌳</span><span>YGG</span></div><div class="hmi-title">${scr.title}</div><div class="hmi-clock" id="clock">--:--:--</div></div>
        <div class="dock dock-west"><nav class="nav-tree" id="nav"></nav></div>
        <div class="dock dock-center"><div class="hmi-content"><h1>${scr.title}</h1>${r.renderDock(scr.docks?.center)}</div></div>
        <div class="dock dock-east"><div class="status-panel">${r.renderDock(scr.docks?.east)}</div></div>
        <div class="dock dock-south"><div>κ=0.618</div></div>
      </div>`;
      if (scr.render) eval(scr.render)(r, el);
      r.hooks.post.forEach(fn => fn(scr, el));
    };
  }
};
window.ScreenModule = ScreenModule;
