/* @udt Render.Loader @t 75 @p Render.Base @r [async,fetch] */
const LoaderModule = {
  init(r) {
    r.loadComponents = async (indexUrl) => {
      const idx = await (await fetch(indexUrl)).json();
      const base = indexUrl.replace('index.json', '');
      for (const f of idx.components) {
        const c = await (await fetch(base + f)).json();
        const name = c['@udt'].split('.').pop().toLowerCase();
        r.reg(name, c);
      }
      return r;
    };
    r.loadScreen = async (url, id) => {
      const udt = await (await fetch(url)).json();
      return udt.instances?.[id] || null;
    };
  }
};
window.LoaderModule = LoaderModule;
