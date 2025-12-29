/* @udt Render.Tags @t 65 @p Render.Base @r [bind] */
const TagsModule = {
  init(r) {
    r.tags = new Map();
    r.bindTags = (tags) => {
      r.tags.clear();
      (tags || []).forEach(t => {
        const el = document.querySelector(t.element);
        if (el) r.tags.set(t.path, { el, ...t });
      });
    };
    r.updateTag = (path, val) => {
      const b = r.tags.get(path);
      if (!b) return;
      let v = b.format ? eval(`val.${b.format}`) : val;
      if (b.transform) v = eval(`(${b.transform})`)(val);
      const [o, k] = b.property.includes('.') ? b.property.split('.') : [null, b.property];
      o ? (b.el[o][k] = v) : (b.el[k] = v);
    };
    r.hook('post', (scr) => r.bindTags(scr.tags));
  }
};
window.TagsModule = TagsModule;
