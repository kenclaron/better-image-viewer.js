# Better-Image-Viewer.js
![npm](https://img.shields.io/npm/dt/better-image-viewer.js)

> Smooth vanilla JavaScript image viewer for websites.

[Website for preview](http://kenclaron.ru)

## Table of contents
- [Features](#features)
- [Getting started](#getting-started)
  - [Syntax](#syntax)
  - [Settings](#settings)
  - [Add Events](#add-events)
  - [Example](#example)
- [License](#license)
- [Browser support](#browser-support)
- [Author](#author)

## Features

- Cross-browser support
- Desktop and mobile platforms support
- Supports custom settings (check out the available [settings](#settings))
- Supports touch, multi-touch
- Supports move
- Supports zoom

## Main

```text
dist/
├── better-image-viewer.css
├── better-image-viewer.min.css  (compressed)
├── better-image-viewer.js
└── better-image-viewer.min.js   (compressed)
```

## Getting Started

### Installation

```
npm install better-image-viewer.js
```

In browser:

```html
<link href="/path/to/better-image-viewer.css" rel="stylesheet">
<script src="/path/to/better-image-viewer.js"></script>
```

### Usage

#### Syntax

```js
  new ImageViewer([settings]);
```

- **settings** (optional)
  - Type: `Object`
  - The settings for viewing. Check out the available [settings](#settings).

#### Settings

```js
  var settings = {
    transition: {
      start: "0.2s ease-in-out",
      end: "0.0s ease-in-out"
    },
    zoom: {
      max: 6,
      min: 1
    }
  }
  new ImageViewer(settings);
```

- **transition** (optional)
  - Type: `Object`
  - Available keys: "start", "end".
    - Type: `String`
  - The settings for start and end animation of image viewer

- **zoom** (optional)
  - Type: `Object`
  - Available keys: "max", "min".
    - Type: `Number`
  - The settings for maximum and minimum zoom of image

#### Add Events

```js
  new ImageViewer.AddEvents([element]);
```

- **element** (optional)
  - Type: `HTMLElement`
  - The target image for viewing 
  - `undefined`/`null` -> all img HTML elements.

#### Example

```js
  var BetterImageViewer = new ImageViewer();
  BetterImageViewer.AddEvents();
```

## License

The Better-Image-Viewer.js licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Browser support

- Chrome (49.0.2623 or latest)
- Firefox (45.0 or latest)
- Opera (36.0.2130.32 or latest)
- Edge (25.10586/EdgeHTML 13.10586 or latest)
- Safari (9.0 or latest)

## Author

> You can express your gratitude by clicking on one of the links

- [Personal website](https://kenclaron.ru)
- [VK](https://vk.com/club190729942)


___________________________________

[↑ back to top](#table-of-contents)
