/**
 * Screen Renderer - Hydrates UDT definitions to HTML
 * κ = 0.618
 */

class ScreenRenderer {
  constructor() {
    this.components = {};
    this.screens = {};
    this.activeScreen = null;
    this.tagBindings = new Map();
  }

  // Register component templates
  registerComponent(name, template) {
    this.components[name] = template;
  }

  // Load screen definitions from UDT
  async loadScreens(url) {
    const res = await fetch(url);
    const udt = await res.json();

    // Register components from UDT
    if (udt.components) {
      Object.entries(udt.components).forEach(([name, tpl]) => {
        this.components[name] = tpl;
      });
    }

    // Store screen instances
    if (udt.instances) {
      this.screens = udt.instances;
    }

    return this;
  }

  // Render template with props (simple mustache-like)
  renderTemplate(template, props = {}) {
    let html = template;

    // Replace {{prop}} with values
    html = html.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return props[key] !== undefined ? props[key] : '';
    });

    // Handle {{#if prop}}...{{/if}}
    html = html.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) => {
      return props[key] ? content : '';
    });

    // Handle {{#each arr}}...{{/each}}
    html = html.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, content) => {
      const arr = props[key];
      if (!Array.isArray(arr)) return '';
      return arr.map(item => this.renderTemplate(content, item)).join('');
    });

    return html;
  }

  // Render a component by type and props
  renderComponent(comp) {
    const template = this.components[comp.type];
    if (!template) {
      console.warn(`Unknown component: ${comp.type}`);
      return `<!-- Unknown: ${comp.type} -->`;
    }

    // Handle nested content (like grids)
    let props = { ...comp.props };
    if (Array.isArray(props.content)) {
      props.content = props.content.map(c => this.renderComponent(c)).join('');
    }

    return this.renderTemplate(template, props);
  }

  // Render a dock's components
  renderDock(dock) {
    if (!dock) return '';

    if (dock.html) {
      return dock.html;
    }

    if (dock.components) {
      return dock.components.map(c => this.renderComponent(c)).join('\n');
    }

    return '';
  }

  // Render full screen into container
  renderScreen(screenId, container) {
    const screen = this.screens[screenId];
    if (!screen) {
      console.error(`Screen not found: ${screenId}`);
      return;
    }

    this.activeScreen = screen;

    // Build screen HTML
    const html = `
      <div class="hmi-shell">
        <div class="dock dock-north">
          <div class="hmi-logo"><span>🌳</span><span>YGGDRASIL</span></div>
          <div class="hmi-title">${screen.title}</div>
          <div class="hmi-clock" id="clock">--:--:--</div>
        </div>

        <div class="dock dock-west">
          <nav class="nav-tree" id="nav-tree"></nav>
        </div>

        <div class="dock dock-center">
          <div class="hmi-content">
            <h1>${screen.title.replace(/^L\d\s+/, '')}</h1>
            ${this.renderDock(screen.docks?.center)}
          </div>
        </div>

        <div class="dock dock-east">
          <div class="status-panel">
            ${this.renderDock(screen.docks?.east)}
          </div>
        </div>

        <div class="dock dock-south">
          <div class="alarm-banner">
            <span class="alarm-count zero" id="alarm-count">0</span>
            <span>Active Alarms</span>
          </div>
          <div>κ* = 0.618 | © 2024 Konomi Systems</div>
          <div>v1.0.0 | ISA-101</div>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Setup tag bindings
    if (screen.tags) {
      this.setupTagBindings(screen.tags);
    }

    // Execute scripts
    if (screen.scripts) {
      screen.scripts.forEach(script => {
        try { eval(script); } catch(e) { console.error('Script error:', e); }
      });
    }

    // Start clock
    this.startClock();

    return this;
  }

  // Setup tag bindings for live updates
  setupTagBindings(tags) {
    this.tagBindings.clear();
    tags.forEach(tag => {
      const el = document.querySelector(tag.element);
      if (el) {
        this.tagBindings.set(tag.path, { el, ...tag });
      }
    });
  }

  // Update a tag value
  updateTag(path, value) {
    const binding = this.tagBindings.get(path);
    if (!binding) return;

    let v = value;

    // Apply format
    if (binding.format && typeof v === 'number') {
      v = eval(`v.${binding.format}`);
    }

    // Apply transform
    if (binding.transform) {
      const fn = eval(`(${binding.transform})`);
      v = fn(value);
    }

    // Set property
    const prop = binding.property;
    if (prop.includes('.')) {
      const [obj, key] = prop.split('.');
      binding.el[obj][key] = v;
    } else {
      binding.el[prop] = v;
    }
  }

  startClock() {
    const el = document.getElementById('clock');
    if (!el) return;
    const update = () => el.textContent = new Date().toTimeString().slice(0, 8);
    update();
    setInterval(update, 1000);
  }
}

// Export
window.ScreenRenderer = ScreenRenderer;
