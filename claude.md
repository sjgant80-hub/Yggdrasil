# Claude CLI Templates

<!--
USAGE: Copy template, replace {{params}}, execute
These are composable building blocks for complex operations
MAX_TOKENS: 250 per file
-->

## File Header Format

All files must include a header UDT comment:
```
/* @udt {id} @t {tokens} @p {parent} @r [{rules}] */
// or for JSON:
{ "@udt": "ID", "@t": 45, "@p": "Parent", "@r": ["rule1"] }
```

### Create Modular File
```json
{
  "@udt": "{{Section}}.{{Name}}",
  "@t": {{tokenCount}},
  "@p": "{{parent}}",
  "@r": [{{rules}}],
  "props": [{{props}}],
  "html": "{{template}}"
}
```

## UDT Operations

### Create UDT File
```bash
# {{section}} = directory name, {{types}} = JSON type definitions
cat > {{section}}/udt.json << 'EOF'
{
  "id": "Yggdrasil.{{Section}}.UDT",
  "parent": "../udt/master.json",
  "description": "{{description}}",
  "types": {{types}},
  "pages": {{pages}}
}
EOF
```

### Register Child UDT
```bash
# {{path}} = relative path to new udt.json
jq '.children += ["{{path}}"]' udt/master.json > tmp.json && mv tmp.json udt/master.json
```

### Add Route
```bash
# {{route}} = /path, {{title}} = display name, {{hmi}} = file path
jq '.routes["{{route}}"] = {"title": "{{title}}", "hmi": "{{hmi}}"}' udt/paths.json > tmp.json && mv tmp.json udt/paths.json
```

## Page Generation

### Create HMI Page
```html
<!-- {{title}}, {{section}}, {{breadcrumb}}, {{content}} -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}} | Yggdrasil</title>
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  <nav class="hmi-nav">{{breadcrumb}}</nav>
  <main class="hmi-panel">
    <h1>{{title}}</h1>
    <p class="kappa-badge">κ = 0.618</p>
    {{content}}
  </main>
  <script src="../assets/js/yggdrasil.js"></script>
</body>
</html>
```

### Create Nav Card Grid
```html
<!-- {{cards}} = array of {href, title, desc} -->
<section class="grid-nav">
{{#each cards}}
  <a href="{{href}}" class="nav-card">
    <h3>{{title}}</h3>
    <p>{{desc}}</p>
  </a>
{{/each}}
</section>
```

### Create Concept Card
```html
<!-- {{title}}, {{body}} -->
<section class="concept-card">
  <h2>{{title}}</h2>
  {{body}}
</section>
```

## JavaScript Components

### Create Simulation Class
```javascript
// {{name}}, {{props}}, {{methods}}
class {{Name}} extends WorldTree {
  constructor(config = {}) {
    super(config.kappa);
    {{#each props}}
    this.{{name}} = config.{{name}} ?? {{default}};
    {{/each}}
  }
  {{#each methods}}
  {{name}}({{params}}) {
    {{body}}
  }
  {{/each}}
}
window.{{Name}} = {{Name}};
```

### Create Test Suite
```javascript
// {{name}}, {{tests}} = array of {desc, fn}
const {{name}}Tests = {
  name: '{{name}}',
  tests: [
    {{#each tests}}
    {
      desc: '{{desc}}',
      fn: () => {
        {{fn}}
      }
    },
    {{/each}}
  ],
  run() {
    let pass = 0, fail = 0;
    this.tests.forEach(t => {
      try { t.fn(); pass++; console.log('✓', t.desc); }
      catch(e) { fail++; console.error('✗', t.desc, e); }
    });
    console.log(`${pass}/${pass+fail} passed`);
    return fail === 0;
  }
};
```

### Add Event Handler
```javascript
// {{selector}}, {{event}}, {{handler}}
document.querySelector('{{selector}}').addEventListener('{{event}}', (e) => {
  {{handler}}
});
```

## Git Operations

### Complete Plan Item
```bash
# {{item}} = task description (will delete from plan.md)
sed -i '/{{item}}/d' plan.md
# Check if plan is empty (only header left)
if [ $(grep -c '^\- \[' plan.md) -eq 0 ]; then
  rm plan.md
  git add -A && git commit -m "chore: plan complete - all items done"
else
  git add -A && git commit -m "chore: plan item completed - {{item}}"
fi
```

### Create Feature Branch
```bash
# {{feature}} = feature name
git checkout -b feature/{{feature}}
```

### Quick Commit
```bash
# {{type}} = feat|fix|chore|docs, {{msg}} = message
git add -A && git commit -m "{{type}}: {{msg}}"
```

## Composite Operations

### Add New Section
```bash
# {{name}}, {{title}}, {{desc}}
mkdir -p {{name}}
# 1. Create UDT
cat > {{name}}/udt.json << 'EOF'
{"id": "Yggdrasil.{{Name}}.UDT", "parent": "../udt/master.json", "types": {}, "pages": ["index.html"]}
EOF
# 2. Create index.html (use HMI Page template)
# 3. Register in master.json
jq '.children += ["{{name}}/udt.json"]' udt/master.json > tmp.json && mv tmp.json udt/master.json
# 4. Add route
jq '.routes["/{{name}}"] = {"title": "{{title}}", "hmi": "{{name}}/index.html"}' udt/paths.json > tmp.json && mv tmp.json udt/paths.json
```

### κ Convergence Test
```javascript
// {{startKappa}}, {{steps}}, {{tolerance}}
const tree = new WorldTree({{startKappa}});
for (let i = 0; i < {{steps}}; i++) tree.step();
const diff = Math.abs(tree.kappa - 0.618033988749895);
if (diff > {{tolerance}}) throw new Error(`κ=${tree.kappa}, diff=${diff}`);
```

## Modular Renderer

### Create Renderer Module
```javascript
/* @udt Render.{{Name}} @t {{tokens}} @p Render.Base @r [{{rules}}] */
const {{Name}}Module = {
  init(r) {
    r.{{method}} = ({{params}}) => {
      {{body}}
    };
  }
};
window.{{Name}}Module = {{Name}}Module;
```

### Create Screen UDT
```json
{
  "@udt": "Screen.{{Name}}",
  "@t": {{tokens}},
  "@p": "HMI.Screen",
  "@r": ["{{level}}"],
  "id": "SCR_{{ID}}",
  "title": "{{title}}",
  "level": "{{level}}",
  "docks": {
    "center": {"components": [{{components}}]},
    "east": {"components": [{{eastComponents}}]}
  },
  "tags": [{{tagBindings}}],
  "render": "(r,el)=>{{{renderCode}}}"
}
```

## Constants Reference

```javascript
const Φ = {
  PHI: 1.618033988749895,
  KAPPA: 0.618033988749895,  // 1/φ optimal
  KAPPA_MIN: 0.381966011250105,  // 1/φ² lower bound
  KAPPA_MAX: 0.809016994374947,  // φ/2 upper bound
  ALPHA: 2.854  // convergence rate
};
```
