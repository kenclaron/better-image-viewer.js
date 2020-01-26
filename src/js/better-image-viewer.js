/****************************\
| Better Image Viewer        |
| version: 1.0               |
|                            |
| author: KenClaron          |
| website: kenclaron.ru      |
| mail: kenclaron@gmail.com  |
\****************************/

console.info("[better-image-viewer.js] Version - 1.0");

class ImageViewer {
  /**
   * Initialize and create a viewer object in a document
   */
  constructor() { 
    this.settings = {
      transition: {
        start: "0.2s ease-in-out", 
        end: "0.0s ease-in-out"
      },
      scale: {
        max: 6,
        min: 1
      }
    };
    this.currentScale = 1;
    this.dateFirstClicked = 0;
    this.isPressed = false;
    this.isOpened = false;
    this.isFirstClicked = false;
    this.source = undefined;
    this.handlers = {
      wheel: undefined,
      mousedown: undefined,
      mousemove: undefined,
      mouseup: undefined,
      touchstart: undefined,
      touchmove: undefined,
      touchend: undefined,
      resize: undefined
    }
  }

  /**
   * Add events for <img> elements
   * @param {HTMLElement} element adds event only for this <img> element
   * @returns {Boolean} true
   */
  AddEvents(element = null)
  {
    // For all <img> element in document
    if(element == null) {
      Array.prototype.forEach.call(document.getElementsByTagName("img"), function (b) {
        b.addEventListener('click', function() {
          IM.OpenViewer(this);
        });
      });
    }
    // Only for element
    else {
      element.addEventListener('click', function() {
        IM.OpenViewer(this);
      });
    }

    return true;
  }

  /**
   * Create all elements for view images
   * @param {HTMLElement} source img HTMLElement
   * @returns {Boolean} opened/closed
   */
  OpenViewer(source)
  {
    if(this.isOpened) return false;

    /**
     * ------------------------------------------------------------------------
     * Initialization
     * ------------------------------------------------------------------------
     */

    // Create clone of ImageViewer
    let that = this;

    // Update settings
    this.isOpened = true;
    this.source = source;

    // Hide scrollbars
    document.body.style.overflow = "hidden";

    // Create container of ImageViewer 
    let container = document.createElement("div");
    container.id = "image-viewer-container";

    setTimeout(() => {
      container.style.transition = this.settings.transition.start;
      container.style.backgroundColor = "#000f";
    }, 10);
    setTimeout(() => {
      container.style.transition = this.settings.transition.end;
    }, 200);

    // Create img element of ImageViewer
    let image = document.createElement("img");
    image.src = source.src;
    
    // Get position of image on screen and animate img element
    let source_rect = source.getBoundingClientRect();
    image.style.maxWidth = source.clientWidth + "px";
    image.style.maxHeight = source.clientHeight + "px";

    if(image.width == image.height) {
      image.style.minWidth = source.clientWidth + "px";
      image.style.minHeight = source.clientHeight + "px";
    }

    image.style.left = (source_rect.left + source.clientWidth / 2) + "px";
    image.style.top = (source_rect.top + source.clientHeight / 2) + "px";
    image.style.transform = "translate(-50%, -50%) scale(1.0)";

    AnimateStyle(image);

    setTimeout(() => {
      image.style.maxWidth = 100 + "%";
      image.style.maxHeight = 100 + "%";

      if(image.width == image.height) {
        if(window.innerWidth <= window.innerHeight) {
          image.style.minWidth = 100 + "vw";
        }
        else {
          image.style.minHeight = 100 + "vh";
        }
      }

      image.style.left = 50 + "%";
      image.style.top = 50 + "%";
    }, 10);

    // Create close button
    let close = document.createElement("a");
    close.onclick = () => { this.CloseViewer(this); };
    close.textContent = "✖";

    // Add elements in document
    container.append(close);
    container.append(image);
    document.body.append(container);

    /**
     * ------------------------------------------------------------------------
     * Variables for events
     * ------------------------------------------------------------------------
     */

    let position = {
      start: {x: undefined, y: undefined},
      current: {x: undefined, y: undefined}
    }
    let end_diff = {x: 0, y: 0};
    let diff = {x: 0, y: 0};

    /**
     * ------------------------------------------------------------------------
     * Mouse Events
     * ------------------------------------------------------------------------
     */

    window.addEventListener("wheel", that.handlers.wheel = function(e) {
      let delta = e.deltaY || e.detail || e.wheelDelta;

      ScrollZoomImage(that, image, delta, false);
    });

    window.addEventListener("mousedown", that.handlers.mousedown = function(e) {
      that.isPressed = true;

      // Double click / tap
      if(that.isFirstClicked && Date.now() < that.dateFirstTouch + 300) {
        that.isFirstClicked = false;
        ScrollZoomImage(that, image, -Math.sqrt(image.width * image.height * 5), true);
      }
      else {
        that.isFirstClicked = true;
        that.dateFirstTouch = Date.now();
      }
      
      position.start.x = e.clientX;
      position.start.y = e.clientY;
    });

    window.addEventListener("mousemove", that.handlers.mousemove = function(e) {
      if(that.isPressed) {
        that.isFirstClicked = false;

        position.current.x = e.clientX;
        position.current.y = e.clientY;

        MoveImage(that, image, position);
      }
    });

    window.addEventListener("mouseup", that.handlers.mouseup = function(e) {
      that.isPressed = false;
      
      AnimateStyle(image);

      EndMoveImage(that, image);

      end_diff = diff;
    });

    /**
     * ------------------------------------------------------------------------
     * Touch Events
     * ------------------------------------------------------------------------
     */

    let first_offset = {
      x: undefined,
      y: undefined
    };
    let distanceMoveBack = {x: 0, y: 0};

    window.addEventListener("touchstart", that.handlers.touchstart = function(e) {
      that.isPressed = true;

      let touch = e.changedTouches[0];

      position.start.x = touch.clientX;
      position.start.y = touch.clientY;
    });

    window.addEventListener("touchmove", that.handlers.touchmove = function(e) {
      if(that.isPressed) {
        if(e.touches.length >= 2) {
          let first = e.changedTouches[0];
          let second = e.changedTouches[1];
        
          let offset = {x: undefined, y: undefined};

          if(first.clientX < second.clientX) {
            let tmp = first;
            first = second;
            second = tmp;

            offset.x = first.clientX - second.clientX;

            // Top-left
            if(first.clientY < second.clientY) {
              offset.y = second.clientY - first.clientY;
            }
            // Bottom-left
            else {
              offset.y = first.clientY - second.clientY;
            }
          }
          else {
            offset.x = first.clientX - second.clientX;

            // Top-right
            if(first.clientY < second.clientY) {
              offset.y = second.clientY - first.clientY;
            }
            // Bottom-right
            else {
              offset.y = first.clientY - second.clientY;
            }
          }

          // Get offset when user press for the first time
          if(first_offset.x == undefined) {
            first_offset.x = offset.x,
            first_offset.y = offset.y
          };

          // Difference first and final move
          let distanceMove = {
            x: offset.x - first_offset.x,
            y: offset.y - first_offset.y
          };

          // Get result X-axis
          let result_x = (distanceMove.x - distanceMoveBack.x) / 100;
          // Get result Y-axis
          let result_y = (distanceMove.y - distanceMoveBack.y) / 100;

          // Get end result, greatest movement along the x axis or y axis
          let result = Math.abs(result_x) > Math.abs(result_y) ? result_x : result_y;

          that.currentScale = isNaN(that.currentScale + result) ? that.currentScale : Number(that.currentScale + result);
          if(that.currentScale < 0.5) {
            that.currentScale = 0.5;
          }
          if(isNaN(that.currentScale)) {
            that.currentScale = "ERROR #001";
          }

          image.style.transform = "translate(calc(-50% - " + diff.x + "px), calc(-50% - " + diff.y + "px)) scale(" + that.currentScale + ")";

          // Backup variable
          distanceMoveBack = distanceMove;
        }
        // Move image
        else {
          let touch = e.changedTouches[0];

          position.current.x = touch.clientX;
          position.current.y = touch.clientY;
          
          MoveImage(that, image, position);
        }
      }
    });

    window.addEventListener("touchend", that.handlers.touchend = function(e) {
      that.isPressed = false;

      first_offset = {
        x: undefined,
        y: undefined
      };
      distanceMoveBack = {
        x: 0,
        y: 0
      };

      if(that.currentScale < that.settings.scale.min) {
        that.currentScale = that.settings.scale.min;
      }
      else if(that.currentScale > that.settings.scale.max) {
        that.currentScale = that.settings.scale.max;
      }

      AnimateStyle(image);

      EndMoveImage(that, image);

      end_diff = diff;
    });

    /**
     * ------------------------------------------------------------------------
     * Resize Event
     * ------------------------------------------------------------------------
     */

    window.addEventListener("resize", that.handlers.resize = function(e) {
      ScrollZoomImage(that, image, that.settings.scale.max * 150);

      image.style.minHeight = "";
      image.style.minWidth = "";

      if(image.width == image.height) {
        if(window.innerWidth <= window.innerHeight) {
          image.style.minWidth = image.style.minHeight = 100 + "vw";
        }
        else {
          image.style.minWidth = image.style.minHeight = 100 + "vh";
        }
      }

    });


    /**
     * ------------------------------------------------------------------------
     * Functions
     * ------------------------------------------------------------------------
     */

    /**
     * Add and subsequent auto-delete css-transition on image
     * @param {HTMLElement} image <img> HTMLElement in document
     * @returns {Boolean} true
     */
    function AnimateStyle(image) 
    {
      image.style.transition = that.settings.transition.start;

      setTimeout(() => {
        image.style.transition = that.settings.transition.end;
      }, 200);

      return true;
    }

    /**
     * Move image to position
     * @param {ImageViewer} that Clone of current ImageViewer
     * @param {HTMLElement} image <img> HTMLElement in document
     * @param {Object} position Position of cursor
     * @returns {Boolean} true
     */
    function MoveImage(that, image, position)
    {
      diff = {
        x: end_diff.x + position.start.x - position.current.x,
        y: end_diff.y + position.start.y - position.current.y,
      }

      if(that.currentScale <= that.settings.scale.min) {
        image.style.transform = "translate(calc(-50%), calc(-50% - " + diff.y + "px)) scale(" + that.currentScale + ")";
      }
      else {
        image.style.transform = "translate(calc(-50% - " + diff.x + "px), calc(-50% - " + diff.y + "px)) scale(" + that.currentScale + ")";
      }

      return true;
    }

    /**
     * Define of the end position for the image
     * @param {ImageViewer} that Clone of current ImageViewer
     * @param {HTMLElement} image <img> HTMLElement in document
     * @returns {Boolean} true
     */
    function EndMoveImage(that, image)
    {
      if(that.currentScale <= that.settings.scale.min) {
        if(diff.y > image.height / 2 || diff.y < -image.height / 2) {
          that.CloseViewer();
        }
        else {
          image.style.transform = "translate(calc(-50%), calc(-50%)) scale(" + that.currentScale + ")";
          diff.x = 0;
          diff.y = 0;
        }
      }
      else {
        let rect = image.getBoundingClientRect();

        if(rect.left > 0) {
          diff.x += rect.left;
        }
        else if(rect.right < window.innerWidth) {
          diff.x -= window.innerWidth - rect.right;
        }
        
        if(rect.top > 0) {
          diff.y += rect.top;
        }
        else if(rect.bottom < window.innerHeight) {
          diff.y -= window.innerHeight - rect.bottom;
        }

        if((rect.top > 0 && rect.bottom < window.innerHeight) || rect.height < window.innerHeight) {
          diff.y = 0;
        }
        if((rect.left > 0 && rect.right < window.innerWidth) || rect.width < window.innerWidth) {
          diff.x = 0;
        }

        image.style.transform = "translate(calc(-50% - " + diff.x + "px), calc(-50% - " + diff.y + "px)) scale(" + that.currentScale + ")";
      }

      return true;
    }

    /**
     * Zoom Image
     * @param {ImageViewer} that Clone of current ImageViewer
     * @param {HTMLElement} image <img> HTMLElement in document
     * @param {Number} delta Difference to enlarge or reduce image 
     * @value delta > 0 | Reduce image
     * @value delta < 0 | Enlarge image
     * @param {Boolean} force Double click 
     * @returns true
     */
    function ScrollZoomImage(that, image, delta, force = false)
    {
      if(force && that.currentScale < window.innerHeight / image.clientHeight) {
        that.currentScale = window.innerHeight / image.clientHeight;
      }
      else if(force && that.currentScale < that.settings.scale.max) {
        that.currentScale = that.settings.scale.max;
      }
      else if(force && that.currentScale == that.settings.scale.max) {
        that.currentScale = that.settings.scale.min;
      }
      else {
        that.currentScale = (that.currentScale - delta / 1000).toFixed(2);
      }

      if(that.currentScale < that.settings.scale.min) {
        that.currentScale = that.settings.scale.min;
      }
      else if(that.currentScale > that.settings.scale.max) {
        that.currentScale = that.settings.scale.max;
      }
      
      image.style.transform = image.style.transform.split("scale")[0] + " scale(" + that.currentScale + ") " + image.style.transform.split("scale")[1].split(")")[1];

      if(delta > 0) {
        if(that.currentScale >= 3) {
          diff.x = diff.x / 1.1;
          diff.y = diff.y / 1.1;
        }
        else if(that.currentScale < 3 && that.currentScale >= 2) {
          diff.x = diff.x / 1.15;
          diff.y = diff.y / 1.15;
        }
        else if(that.currentScale == 1) {
          diff.x = 0;
          diff.y = 0;
        }
        else {
          diff.x = diff.x / 1.5;
          diff.y = diff.y / 1.5;
        }

        image.style.transform = "translate(calc(-50% - " + diff.x + "px), calc(-50% - " + diff.y + "px)) scale(" + that.currentScale + ")";
      }

      return true;
    }
  }

  /**
   * Close and delete all elements of viewer
   * @returns {Boolean} true
   */
  CloseViewer()
  {
    window.removeEventListener("wheel", this.handlers.wheel);
    window.removeEventListener("mousedown", this.handlers.mousedown);
    window.removeEventListener("mousemove", this.handlers.mousemove);
    window.removeEventListener("mouseup", this.handlers.mouseup);
    window.removeEventListener("touchstart", this.handlers.touchstart);
    window.removeEventListener("touchmove", this.handlers.touchmove);
    window.removeEventListener("touchend", this.handlers.touchend);
    window.removeEventListener("resize", this.handlers.resize);

    let container = document.getElementById("image-viewer-container");
    let image = document.getElementById("image-viewer-container").getElementsByTagName("img")[0];
    let close = document.getElementById("image-viewer-container").getElementsByTagName("a")[0];

    // Animate elements of ImageViewer
    container.style.transition = this.settings.transition.start;
    container.style.backgroundColor = "#0000";

    let source_rect = this.source.getBoundingClientRect();
    image.style.transition = this.settings.transition.start;
    image.style.transform = "translate(-50%, -50%) scale(1.0)";

    setTimeout(() => {
      image.style.maxWidth = source_rect.width + "px";
      image.style.maxHeight = source_rect.height + "px";

      if(image.width == image.height) {
        if(window.innerWidth <= window.innerHeight) {
          image.style.minWidth = source_rect.width + "px";
        }
        else {
          image.style.minHeight = source_rect.height + "px";
        }
      }

      image.style.left = (source_rect.left + source_rect.width / 2) + "px";
      image.style.top = (source_rect.top + source_rect.height / 2) + "px";
      
      document.body.style.overflow = "";
    }, 10);

    close.style.transition = this.settings.transition.start;
    close.style.opacity = 0;

    setTimeout(() => {
      container.remove();
    }, 200);
    
    this.currentScale = 1;
    this.dateFirstClicked = 0;
    this.isPressed = false;
    this.isOpened = false;
    this.isFirstClicked = false;
    this.source = undefined;
    this.handlers = {
      wheel: undefined,
      mousedown: undefined,
      mousemove: undefined,
      mouseup: undefined,
      touchstart: undefined,
      touchmove: undefined,
      touchend: undefined,
      resize: undefined
    }

    return true;
  }
}
