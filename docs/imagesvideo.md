# :framed_picture: Preloading images

The <SmileText/> offers two ways to preload images:

If your experiment is simple enough such that most or all images included in the
project will likely be used, you can set the optional flag `preloadImages` in
`api.completeConsent` to true (`api.completeConsent(true)`). This will load all
images in the background once a participant has consented to participate in the
experiment.

Alternatively, suppose you want to preload some images before entering a
particular component. The approach we suggest currently only works with
deterministic timelines -- if you need to preload images before a randomized
timeline route, you'll have to adapt this or contact us for assistance.

We arbitrarily demonstrate this for the `StroopExp`. First, add a
`<script>...</script>` section to the component file, and adapt the following
code snippet to your requirements (probably limiting the glob in some way):

```
<script>
// eslint-disable-next-line import/prefer-default-export
export function preloadAllImages() {
  setTimeout(() => {
      Object.values(import.meta.glob('@/assets/**/*.{png,jpg,jpeg,svg,SVG,JPG,PNG,JPEG}', { eager: true, query: '?url', import: 'default' })).forEach((url) => {
        const image = new Image();
        image.src = url;
      });
    }, 1);
}
</script>
```

Then, in `design.js`, import it in addition to the module itself.

```javascript
// Before:
import StroopExp from '@/components/tasks/StroopExp.vue'
// After:
import {
  default as StroopExp,
  preloadAllImages,
} from '@/components/tasks/StroopExp.vue'
```

Finally, add it as to `meta` under the `preload` key in the route definition.
Being the scenes, <SmileText/> makes sure that when entering the _previous_
component, the preload for the specified component is called, so that preloading
happens before the images are necessary.

```javascript
// stroop exp
timeline.pushSeqRoute({
  path: '/stroop',
  name: 'stroop',
  component: StroopExp,
  meta: {
    preload: preloadAllImages, // add this line, and the entire meta object if doesn't already exist
  },
})
```

_Note_: you cannot dynamically specify the glob (that is, read it from a
variable). For this to work, the glob needs to be hard-coded in the call to
`import.meta.glob`, as this allows [Vite](https://vitejs.dev) to resolve it
appropriately when the experiment is built and deployed. See the restrictions
here:
https://github.com/rollup/plugins/tree/master/packages/dynamic-import-vars#limitations
.
