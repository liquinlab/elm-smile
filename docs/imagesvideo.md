# :framed_picture: Images and Video

Including images, videos, and other content in your experiment is
straightforward. The main issues are where to place the files, how to refer to
them in your components, how to preload them so that the participant doesn't
wait for them to appear, and what to do for very large files that might not be
uploadable in a GitHub repository.

## Including images, videos, and other static assets

Static content refers to files which aren't processed or built using Vite. This
includes binary finals like PNG, JPG, MP4, and so on. In can also include data
sets like .json files you might want to load in your experiment.

## Assets versus Public folder

There are two main places to put static content in a <SmileText/> project.

The first place is the assets folder (specifically, `/src/assets` or
`/src/user/assets/` folders in the project director). Files in the assets
folders are preprocessed in a slightly helpful way. In particular, when your
Smile project is "built" for deployment images and other files in the assets
folder are copied to the `/dist` folder with a unique code appended to the
filename (e.g., `logo.png` might be renamed `logo-139efdf89.png`). This is done
to ensure that the browser does not cache the previous version of the image.
==This can be really helpful== to ensure that participants (and yourself) do not
see old versions of images that you have updated. You refer to these like this

```html
<img src="@/assets/logo.png" alt="logo" />
```

for a `logo.png` file in the `/src/assets` folder. There is another assets
folder in the `/src/users/assets` folder. This is where you should put images
for your project.

```html
<img src="@/user/assets/logo.png" alt="logo" />
```

The second place for static content/images is the top level `/public` folder.
This is where you should put static images that you want to refer to directly in
your HTML or CSS. Content placed in this folder is copied directly into the
`dist` folder on build without the random code renaming. This can be useful
sometimes as well. For example, if you have a logo that you want to appear on
every page, you would put it in the `/public` folder and refer to it in your
HTML or CSS as `/logo.png`.

```html
<img src="/logo.png" alt="logo" />
```

It's fine to create-sub folders in either the `/src/assets`, `/src/user/assets`,
or `/public` folder

## Referring to static assets using code

The examples above use _static_ references to images. This is fine for most
cases. However sometimes your code might dynamically determine which image to
display based on some other logic. In this case, Vite is unable to determine the
image to load at build time because it might depend on user input or some other
dynamic factor.

In this case...

## Preloading

Preloading refers to asking the browser to load an image or video before it is
needed so that the user isn't stuck waiting for it to load. This can be critical
in experiments where the stimuli are images and you want them to display
quickly.

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
timeline.pushSeqView({
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

## Dealing with large files
