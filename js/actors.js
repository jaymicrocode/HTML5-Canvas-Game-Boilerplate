/**
 * @file
 *   Defines useful classes for actors in the world.
 */

/**
 * A Box shape.
 * 
 * @param x
 *   (Optional) The x-coordinate of the top-left corner of the box. Defaults to
 *   the center of the world.
 * @param y
 *   (Optional) The y-coordinate of the top-left corner of the box. Defaults to
 *   the center of the world.
 * @param w
 *   (Optional) The width of the box. Defaults to DEFAULT_WIDTH.
 * @param h
 *   (Optional) The height of the box. Defaults to DEFAULT_HEIGHT.
 * @param fillStyle
 *   (Optional) A default fillStyle to use when drawing the box. Defaults to
 *   black.
 */
var Box = Class.extend({
  init: function(x, y, w, h, fillStyle) {
    this.x = x || Math.floor((world.width-this.DEFAULT_WIDTH)/2);
    this.y = y || Math.floor((world.height-this.DEFAULT_HEIGHT)/2);
    this.width = w || this.DEFAULT_WIDTH;
    this.height = h || this.DEFAULT_HEIGHT;
    this.fillStyle = fillStyle || 'black';

    this.draw();
  },
  /**
   * The default width of a Box.
   */
  DEFAULT_WIDTH: 80,
  /**
   * The default height of a Box.
   */
  DEFAULT_HEIGHT: 80,
  /**
   * Something that can be drawn by context.drawImage() (usually an image file path).
   *
   * If not set, a box will be drawn instead.
   */
  src: null,
  /**
   * The angle (in radians) at which to draw the Box.
   */
  radians: 0,
  /**
   * Draw the Box.
   *
   * @param ctx
   *   (Optional) A canvas graphics context onto which this Box should be drawn.
   *   This is useful for drawing onto Layers. If not specified, defaults to
   *   the global context for the default canvas.
   * @param smooth
   *   (Optional) A boolean indicating whether to force the Box to be drawn at
   *   whole-pixel coordinates. If you don't already know that your coordinates
   *   will be integers, this option can speed up painting since the browser
   *   does not have to interpolate the image. However, sub-pixel-level
   *   precision is lost. Defaults to true.
   *
   * @see drawDefault()
   * @see drawBoundingBox()
   */
  draw: function(ctx, smooth) {
    ctx = ctx || context;
    if (typeof smooth === 'undefined') {
      smooth = true;
    }
    ctx.save();
    ctx.fillStyle = this.fillStyle;
    var x = this.x, y = this.y, w = this.width, h = this.height;
    if (smooth) {
      x = Math.round(x);
      y = Math.round(y);
    }
    if (this.radians) {
      ctx.translate(x+w/2, y+h/2);
      ctx.rotate(this.radians);
      ctx.translate(-w/2-x, -h/2-y);
    }
    if (this.src) {
      ctx.drawImage(this.src, x, y, w, h);
    }
    else {
      this.drawDefault(ctx, x, y, w, h);
    }
    ctx.restore();
  },
  /**
   * Draw the default shape when no image has been applied.
   *
   * This is useful to override for classes that have different standard
   * appearances, rather than overriding the whole draw() method.
   *
   * @see draw()
   */
  drawDefault: function(ctx, x, y, w, h) {
    ctx.fillRect(x, y, w, h);
  },
  /**
   * Draw the outline of the box used to calculate collision.
   *
   * @param ctx
   *   (Optional) A canvas graphics context onto which the outline should be
   *   drawn. This is useful for drawing onto Layers. If not specified,
   *   defaults to the global context for the default canvas.
   * @param fillStyle
   *   (Optional) A fillStyle to use for the box outline.
   *
   * @see draw()
   */
  drawBoundingBox: function(ctx, fillStyle) {
    ctx = ctx || context;
    ctx.fillStyle = fillStyle || this.fillStyle;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  },
  /**
   * Get the x-coordinate of the center of the Box.
   *
   * @see yC()
   */
  xC: function() {
    return this.x + this.width/2;
  },
  /**
   * Get the y-coordinate of the center of the Box.
   *
   * @see xC()
   */
  yC: function() {
    return this.y + this.height/2;
  },
  /**
   * Determine whether this Box overlaps with another Box or set of Boxes.
   *
   * @param collideWith
   *   A Box, Collection of Boxes, or TileMap with which to check for overlap.
   *
   * @return
   *   false if there is no overlap; otherwise, the first item to overlap.
   *
   * @see overlaps()
   */
  collides: function(collideWith) {
    if (collideWith instanceof Box) {
      return this.overlaps(collideWith) ? collideWith : false;
    }
    else if (collideWith instanceof Collection || collideWith instanceof TileMap) {
      var items = collideWith.getAll();
      for (var i = 0, l = items.length; i < l; i++) {
        if (this.overlaps(items[i])) {
          return items[i];
        }
      }
    }
    return false;
  },
  /**
   * Determines whether this Box intersects another Box.
   *
   * @see collide()
   * @see overlapsX()
   * @see overlapsY()
   */
  overlaps: function(otherBox) {
    return this.overlapsX(otherBox) && this.overlapsY(otherBox);
  },
  /**
   * Determines whether this Box intersects another Box on the x-axis.
   *
   * @see overlaps()
   * @see overlapsY()
   */
  overlapsX: function(otherBox) {
    return this.x + this.width >= otherBox.x && otherBox.x + otherBox.width >= this.x;
  },
  /**
   * Determines whether this Box intersects another Box on the y-axis.
   *
   * @see overlaps()
   * @see overlapsX()
   */
  overlapsY: function(otherBox) {
    return this.y + this.height >= otherBox.y && otherBox.y + otherBox.height >= this.y;
  },
  /**
   * Determine whether the mouse is hovering over this Box.
   */
  isHovered: function() {
    return App.isHovered(this);
  },
  /**
   * Listen for a specific event.
   *
   * @param eventName
   *   The name of the event for which to listen, e.g. "click." The event can
   *   have a namespace using a dot, e.g. "click.custom" will bind to the
   *   "click" event with the "custom" namespace. Namespaces are useful for
   *   specifying a certain callback to un-listen. Each object should only have
   *   one function bound to each event-namespace pair, including the global
   *   namespace. That is, you can bind one callback to "click.custom1" and
   *   another callback to "click.custom2," but avoid binding two callbacks to
   *   "click" or "click.custom."
   * @param callback
   *   A function to execute when the relevant event is triggered on the
   *   specified object. Its "this" object is the Box object and it receives
   *   any other parameters passed by the trigger call (usually an event object
   *   is the first parameter).
   * @param weight
   *   (Optional) An integer indicating the order in which callbacks for the
   *   relevant event should be triggered. Lower numbers cause the callback to
   *   get triggered earlier than higher numbers. Generally this is irrelevant.
   *   Defaults to zero.
   *
   * @return
   *   The Box object (this method is chainable).
   *
   * @see once()
   * @see unlisten()
   */
  listen: function(eventName, callback, weight) {
    return App.Events.listen(this, eventName, callback, weight);
  },
  /**
   * Listen for a specific event and only react the first time it is triggered.
   *
   * This method is exactly the same as Box.listen() except that the specified
   * callback is only executed the first time it is triggered.
   *
   * @see listen()
   * @see unlisten()
   */
  once: function(eventName, callback, weight) {
    return App.Events.once(this, eventName, callback, weight);
  },
  /**
   * Stop listening for a specific event.
   *
   * @param eventName
   *   The name of the event to which to stop listening. Can be namespaced with
   *   a dot, e.g. "click.custom" removes a listener for the "click" event
   *   that has the "custom" namespace. If the event specified does not have a
   *   namespace, all callbacks will be unbound regardless of their namespace.
   *
   * @return
   *   The Box object (this method is chainable).
   *
   * @see listen()
   * @see once()
   */
  unlisten: function(eventName) {
    return App.Events.unlisten(this, eventName);
  },
  /**
   * Destroy the Box.
   *
   * Override this method to trigger an event when the object is destroyed. For
   * example, this would allow displaying an explosion when a bullet hit a
   * target.
   */
  destroy: function() {},
});

/**
 * A container to keep track of multiple Boxes/Box descendants.
 * 
 * @param items
 *   (Optional) An Array of Boxes that the Collection should hold.
 */
function Collection(items) {
  this.items = items || [];
}
Collection.prototype = {
  /**
   * Draw every object in the Collection.
   *
   * @param ctx
   *   (Optional) A canvas graphics context onto which to draw. This is useful
   *   for drawing onto Layers. If not specified, defaults to the global
   *   context for the default canvas.
   *
   * @see Box.draw()
   */
  draw: function(ctx) {
    ctx = ctx || context;
    for (var i = 0; i < this.items.length; i++) {
      this.items[i].draw(ctx);
    }
  },
  /**
   * Determine whether any object in this Collection intersects with a Box.
   *
   * @param box
   *   The Box with which to detect intersection.
   *
   * @return
   *   true if intersection is detected; false otherwise.
   */
  overlaps: function(box) {
    for (var i = 0; i < this.items.length; i++) {
      if (this.items[i].overlaps(box)) {
        return true;
      }
    }
    return false;
  },
  /**
   * Execute a function on every item in the Collection.
   *
   * Return true to remove the item from the Collection.
   *
   * @param f
   *   The function to execute on each item, or the (string) name of a method
   *   of each object in the Collection that should be invoked. In the first
   *   case, the function should return a truthy value in order to remove the
   *   item being processed from the Collection. In the second case, additional
   *   arguments to the forEach method are also passed on to the items' method.
   *
   * @return
   *   The Collection object (this method is chainable).
   */
  forEach: function(f) {
    if (typeof f == 'string') {
      return this._executeMethod.apply(this, arguments);
    }
    for (var i = this.items.length-1; i >= 0; i--) {
      if (f(this.items[i])) {
        if (this.items[i].destroy instanceof Function) {
          this.items[i].destroy();
        }
        this.items.splice(i, 1);
      }
    }
    return this;
  },
  /**
   * Execute an arbitrary method of all items in the Collection.
   *
   * All items in the Collection are assumed to have the specified method.
   *
   * @param name
   *    The name of the method to invoke on each object in the Collection.
   * @param ...
   *    Additional arguments are passed on to the specified method.
   *
   * @see forEach()
   */
  _executeMethod: function(name) {
    Array.prototype.shift.call(arguments);
    for (var i = 0; i < this.items.length; i++) {
      this.items[i][name].apply(this.items[i], arguments);
    }
    return this;
  },
  /**
   * Add an item to the Collection.
   *
   * @param item
   *   The Box to add to the Collection.
   *
   * @return
   *   The number of items in the Collection.
   */
  add: function(item) {
    return this.items.push(item);
  },
  /**
   * Add the items in an Array to the Collection.
   *
   * @param items
   *   An Array of Boxes to add to the Collection.
   *
   * @return
   *   The Collection object (this method is chainable).
   *
   * @see combine()
   */
  concat: function(items) {
    this.items = this.items.concat(items);
    return this;
  },
  /**
   * Add the items in another Collection to this Collection.
   *
   * @param otherCollection
   *   A Collection whose items should be added to this Collection.
   *
   * @return
   *   The Collection object (this method is chainable).
   *
   * @see concat()
   */
  combine: function(otherCollection) {
    this.items = this.items.concat(otherCollection.items);
    return this;
  },
  /**
   * Remove an item from the Collection.
   *
   * @param item
   *   The Box to remove from the Collection.
   *
   * @return
   *   An array containing the removed element, if any.
   *
   * @see removeLast()
   */
  remove: function(item) {
    return this.items.remove(item);
  },
  /**
   * Remove and return the last item in the Collection.
   */
  removeLast: function() {
    return this.items.pop();
  },
  /**
   * Return the number of items in the Collection.
   */
  count: function() {
    return this.items.length;
  },
  /**
   * Return an array containing all items in the Collection.
   */
  getAll: function() {
    return this.items;
  },
  /**
   * Remove all items in the Collection.
   *
   * @return
   *   The Collection object (this method is chainable).
   */
  removeAll: function() {
    this.items = [];
    return this;
  },
};

/**
 * A wrapper for image tiles so they can be drawn in the right location.
 *
 * Used internally by TileMap.
 *
 * src can be any object of type String (e.g. a file path to an image),
 * Image, HTMLImageElement, HTMLCanvasElement, Sprite, or SpriteMap.
 */
function ImageWrapper(src, x, y, w, h) {
  this.src = src;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  /**
   * Draws the image.
   */
  this.draw = function() {
    context.drawImage(this.src, this.x, this.y, this.w, this.h);
  };
}

/**
 * A grid of objects (like a 2D Collection) for easy manipulation.
 *
 * TileMaps are useful for rapidly initializing and managing large sets of
 * same-sized "tiles," a common need for many 2D games. TileMaps can be created
 * either empty (ready to be filled in later) or with a predetermined set of
 * objects. In the first case the grid and map parameters are ignored and a
 * blank grid is created using the dimensions specified in options.gridSize
 * (which is then required). In the second case, there are three possibilities:
 * - The grid is a two-dimensional array where each inner value is a key for
 *   the map object, and the map object maps these keys to objects that
 *   represent each tile
 * - The grid is a string representing a two-dimensional array just like the
 *   previous possibility, where each character in the string is a key for the
 *   map object (except newlines, which identify new rows) and the map object
 *   maps these keys to objects that represent each tile. An underscore (_)
 *   represents null (a blank tile).
 * - The grid is a two-dimensional array where each inner value is either null
 *   (representing a blank tile) or a constructor function (e.g. Box) or some
 *   form of image (anything that context.drawImage() can draw).
 *
 * @param grid
 *   As described above, grid can either be a string, a 2D array of strings, a
 *   2D array of constructors, or discarded altogether.
 * @param map
 *   An array or object whose keys are found in the grid and whose values are
 *   one of the following:
 *   - null: Indicates a blank tile.
 *   - A String object: Assumed to be a path to an image file that should be
 *     used to render the tile.
 *   - An Image, HTMLImageElement, HTMLCanvasElement, Sprite, or SpriteMap
 *     object: An image used to render the tile.
 *   - Box, or a descendant of Box: Passing the literal class (not an instance)
 *     will cause the TileMap to automatically initialize instances of that
 *     class. Since the caller can only access the new instances through the
 *     TileMap, this is most effective when used with a descendant of Box that
 *     already has a representative image baked in.
 *   This value is irrelevant if options.gridSize is specified since the entire
 *   TileMap is created as a blank grid. However, it must still be an object or
 *   array. This parameter can also be null or undefined (or not passed) if
 *   an array of constructors is used.
 * @param options
 *   (Optional) A hash of configuration settings for the TileMap:
 *   - gridSize: Defaults to null, in which case it is ignored. If this is a
 *     two-element array containing positive integers, then the TileMap is
 *     initialized as a blank grid using these dimensions (w*h or col*row) and
 *     the grid and map parameters become irrelevant.
 *   - cellSize: A two-element array containing positive integers indicating
 *     the width and height in pixels of each tile. Defaults to the default
 *     dimensions of a Box.
 *   - startCoords: A two-element array containing positive integers indicating
 *     the x- and y-coordinates of the upper-left corner of the TileMap
 *     relative to the World. Defaults to placing the lower-left corner of the
 *     TileMap at the lower-left corner of the world.
 */
function TileMap(grid, map, options) {
  // Setup and options
  var i, j, l, m;
  this.options = {
      cellSize: [Box.prototype.DEFAULT_WIDTH, Box.prototype.DEFAULT_HEIGHT],
      gridSize: null,
  };
  if (options && options.cellSize instanceof Array && options.cellSize.length > 1) {
    this.options.cellSize = options.cellSize;
  }
  if (options && options.gridSize instanceof Array && options.gridSize.length > 1) {
    this.options.gridSize = options.gridSize;
  }
  // Place the TileMap in the lower-left corner of the world.
  if (typeof this.options.startCoords === 'undefined' ||
      this.options.startCoords.length == 0) {
    this.options.startCoords = [0, world.height - this.options.cellSize[1] *
                                  (typeof grid == 'string' ? grid.split("\n") : grid).length
                                ];
  }
  var gs = this.options.gridSize,
      cw = this.options.cellSize[0],
      ch = this.options.cellSize[1],
      sx = this.options.startCoords[0],
      sy = this.options.startCoords[1];

  // If options.gridSize was specified, build a blank grid.
  if (gs instanceof Array && gs.length > 0) {
    grid = new Array(gs[0]);
    for (i = 0; i < gs[0]; i++) {
      grid[i] = new Array(gs[1]);
      for (j = 0; j < gs[1]; j++) {
        grid[i][j] = null;
      }
    }
  }
  // Allow specifying grid as a string; we'll deconstruct it into an array.
  if (typeof grid == 'string') {
    grid = grid.split("\n");
    for (i = 0, l = grid.length; i < l; i++) {
      grid[i] = grid[i].split('');
    }
  }
  this.grid = grid;
  // Make _ (underscore) mean null (blank) unless otherwise specified.
  if (typeof map !== 'undefined' && typeof map['_'] === 'undefined') {
    map['_'] = null;
  }

  // Initialize all the objects in the grid.
  for (i = 0, l = grid.length; i < l; i++) {
    for (j = 0, m = grid[i].length; j < m; j++) {
      // Avoid errors with map[] and allow writing null directly
      if (grid[i][j] === null) {
        this.grid[i][j] = null;
        continue;
      }
      var o = map ? map[grid[i][j]] : grid[i][j];
      // Blank tile or no match is found in map
      if (o === null || o === undefined) {
        this.grid[i][j] = null;
      }
      else {
        var x = sx + j * cw, y = sy + i * ch; // x- and y-coordinates of tile
        // We can handle any image type that context.drawImage() can draw
        if (typeof o === 'string' ||
            o instanceof Image ||
            o instanceof HTMLImageElement ||
            o instanceof HTMLCanvasElement ||
            o instanceof Sprite ||
            o instanceof SpriteMap ||
            o instanceof Layer) {
          this.grid[i][j] = new ImageWrapper(o, x, y, cw, ch);
        }
        // If we have a Class, initialize a new instance of it
        else if (o instanceof Function) {
          this.grid[i][j] = new (Function.prototype.bind.call(o, null, x, y, cw, ch));
        }
        else { // fallback
          this.grid[i][j] = null;
        }
      }
    }
  }
  /**
   * Draw all the tiles.
   *
   * @param ctx
   *   (Optional) A canvas graphics context onto which to draw the tiles. This
   *   is useful for drawing onto Layers. If not specified, defaults to the
   *   global context for the default canvas.
   * @param occlude
   *   (Optional) A boolean indicating whether to only draw tiles that are
   *   visible within the viewport. This is performance-friendly for huge
   *   TileMaps. Note that if you enable occlusion, you need to re-draw the
   *   TileMap whenever the viewport scrolls. If you are just drawing the
   *   TileMap once, for example onto a background Layer cache, occluding is
   *   unnecessary. Defaults to false (all tiles are drawn).
   * @param smooth
   *   (Optional) A boolean indicating whether to force the Box to be drawn at
   *   whole-pixel coordinates. If you don't already know that your coordinates
   *   will be integers, this option can speed up painting since the browser
   *   does not have to interpolate the image. However, sub-pixel-level
   *   precision is lost. If you do know that your coordinates will be
   *   integers, enabling this option will be slower. Defaults to whatever the
   *   default is for each object being drawn.
   */
  this.draw = function(ctx, occlude, smooth) {
    ctx = ctx || context;
    var i, l;
    if (occlude) {
      var active = this.getCellsInRect();
      for (i = 0, l = active.length; i < l; i++) {
        active[i].draw(ctx, smooth);
      }
      return;
    }
    for (i = 0, l = this.grid.length; i < l; i++) {
      for (var j = 0, m = this.grid[i].length; j < m; j++) {
        var o = this.grid[i][j];
        if (o !== null) {
          o.draw(ctx, smooth);
        }
      }
    }
  };
  /**
   * Get the object at a specific tile using the row and column.
   */
  this.getCell = function(row, col) {
    return this.grid[row] ? this.grid[row][col] : undefined;
  };
  /**
   * Place a specific object into a specific tile using the row and column.
   *
   * If an object is already located there, it will be overwritten.
   */
  this.setCell = function(row, col, obj) {
    if (this.grid[row] && typeof this.grid[row][col] !== 'undefined') {
      this.grid[row][col] = obj;
    }
  };
  /**
   * Clear a specific tile (make it blank).
   */
  this.clearCell = function(row, col) {
    if (this.grid[row] && typeof this.grid[row][col] !== 'undefined') {
      this.grid[row][col] = null;
    }
  };
  /**
   * Return an array of all non-null objects in the TileMap.
   *
   * For large TileMaps, consider using getCellsInRect() for efficiency, since
   * it only returns cells within a certain area (the viewport by default).
   *
   * Note that if you just used a TileMap to easily initialize a bunch of
   * tiles, or if you're not adding or removing tiles frequently but you are
   * calling this function frequently, you can also convert your TileMap to a
   * Collection:
   *
   * var myCollection = new Collection(myTileMap.getAll());
   *
   * This is more efficient if you always need to process every item in the
   * TileMap and you don't care about their relative position.
   *
   * @see getCellsInRect()
   */
  this.getAll = function() {
    var w = this.grid.length, h = (w > 0 ? this.grid[0].length : 0), r = [], i, j;
    for (i = 0; i < w; i++) {
      for (j = 0; j < h; j++) {
        if (this.grid[i][j] !== null) {
          r.push(this.grid[i][j]);
        }
      }
    }
    return r;
  };
  /**
   * Clear all tiles (make them blank).
   */
  this.clearAll = function() {
    var w = this.grid.length, h = (w > 0 ? this.grid[0].length : 0), i, j;
    this.grid = new Array(w);
    for (i = 0; i < w; i++) {
      this.grid[i] = new Array(h);
      for (j = 0; j < h; j++) {
        grid[i][j] = null;
      }
    }
  };
  /**
   * Get the number of rows in the grid.
   *
   * @see getCols()
   */
  this.getRows = function() {
    return this.grid.length;
  };
  /**
   * Get the number of columns in the grid.
   *
   * @see getRows()
   */
  this.getCols = function() {
    return this.grid.length > 0 ? this.grid[0].length : 0;
  };
  /**
   * Execute a function on every element in the TileMap.
   *
   * @param f
   *   The function to execute on each tile. Parameters are the object being
   *   processed, its row, and its column. (This lets the function use
   *   getCell() if it needs to check surrounding cells.) The function should
   *   return a truthy value to remove the object being processed from the
   *   TileMap.
   * @param includeNull
   *   (Optional) A boolean indicating whether to execute the function on null
   *   elements as well as other tiles. Defaults to false.
   *
   * @return
   *   The TileMap object (this method is chainable).
   */
  this.forEach = function(f, includeNull) {
    var w = this.grid.length, h = (w > 0 ? this.grid[0].length : 0), i, j;
    for (i = 0; i < w; i++) {
      for (j = 0; j < h; j++) {
        if (this.grid[i][j] !== null || includeNull) {
          if (f(this.grid[i][j], i, j)) {
            if (this.grid[i][j].destroy instanceof Function) {
              this.grid[i][j].destroy();
            }
            this.clearCell(i, j);
          }
        }
      }
    }
    return this;
  };
  /**
   * Gets the max and min array coordinates of cells that are in a rectangle.
   */
  this._getCellCoordsInRect = function(wx, wy, tw, th) {
    if (typeof wx === 'undefined') wx = world.xOffset;
    if (typeof wy === 'undefined') wy = world.yOffset;
    if (typeof tw === 'undefined') tw = canvas.width;
    if (typeof th === 'undefined') th = canvas.height;
    var x = this.options.startCoords[0], y = this.options.startCoords[1];
    var cw = this.options.cellSize[0], cy = this.options.cellSize[1];
    var sx = (wx - x) / cw, sy = (wy - y) / cy;
    var sxe = (wx + tw - x) / cw, sye = (y - wy + th) / cy;
    // startCol, startRow, endCol, endRow
    return [Math.floor(sx), Math.floor(sy), Math.ceil(sxe), Math.ceil(sye)];
  };
  /**
   * Return all objects within a given rectangle.
   *
   * This method returns an array of all non-null objects in the TileMap within
   * a rectangle specified in pixels. If no rectangle is specified, this method
   * defaults to retrieving all objects in view (i.e. it uses the viewport as
   * the rectangle).
   *
   * This is an efficient way to process only objects that are in view (or
   * nearly in view) which is extremely useful for efficient processing of only
   * relevant information in a very large map.
   *
   * @see getAll()
   */
  this.getCellsInRect = function(x, y, w, h) {
    // startCol, startRow, endCol, endRow
    var r = this._getCellCoordsInRect(x, y, w, h), s = [];
    var startRow = Math.min(this.getRows(), Math.max(0, r[1]));
    var endRow = Math.min(this.getRows(), Math.max(0, r[3]));
    var startCol = Math.min(this.getCols(), Math.max(0, r[0]));
    var endCol = Math.min(this.getCols(), Math.max(0, r[2]));
    for (var i = startRow, l = endRow; i < l; i++) {
      for (var j = startCol, m = endCol; j < m; j++) {
        if (this.grid[i][j] !== null) {
          s.push(this.grid[i][j]);
        }
      }
    }
    return s;
  };
}

/**
 * The World object.
 * 
 * The World represents the complete playable game area. Its size can be set
 * explicitly or is automatically determined by the "data-worldwidth" and
 * "data-worldheight" attributes set on the HTML canvas element (with a
 * fallback to the canvas width and height). If the size of the world is larger
 * than the canvas then the view of the world will scroll when the player
 * approaches a side of the canvas (this behavior occurs in Player.move()).
 * 
 * @param w
 *   (optional) The width of the world. Defaults to the value of the
 *   "data-worldwidth" attribute on the HTML canvas element, or (if that
 *   attribute is not present) the width of the canvas element.
 * @param h
 *   (optional) The height of the world. Defaults to the value of the
 *   "data-worldheight" attribute on the HTML canvas element, or (if that
 *   attribute is not present) the height of the canvas element.
 */
function World(w, h) {
  // The dimensions of the world.
  this.width = w || parseInt($canvas.attr('data-worldwidth'), 10) || canvas.width;
  this.height = h || parseInt($canvas.attr('data-worldheight'), 10) || canvas.height;
  
  // The pixel-offsets of what's being displayed in the canvas compared to the world origin.
  this.xOffset = (this.width - canvas.width)/2;
  this.yOffset = (this.height - canvas.height)/2;
  context.translate(-this.xOffset, -this.yOffset);
  /**
   * Returns an object with 'x' and 'y' properties indicating how far offset
   * the viewport is from the world origin.
   */
  this.getOffsets = function() {
    return {
      'x': this.xOffset,
      'y': this.yOffset,
    };
  };

  /**
   * Resize the world to new dimensions.
   *
   * Careful! This will shift the viewport regardless of where the player is.
   * Objects already in the world will retain their coordinates and so may
   * appear in unexpected locations on the screen.
   */
  this.resize = function(newWidth, newHeight) {
    // Try to re-center the offset of the part of the world in the canvas
    // so we're still looking at approximately the same thing.
    var deltaX = (newWidth - this.width) / 2, deltaY = (newHeight - this.height) / 2;
    this.xOffset += deltaX;
    this.yOffset += deltaY;
    context.translate(-deltaX, -deltaY);
    
    // Change the world dimensions.
    this.width = newWidth;
    this.height = newHeight;
    
    /**
     * Broadcast that the world size changed so that objects already in the
     * world or other things that depend on the world size can update their
     * position or size accordingly.
     */
    jQuery(document).trigger('resizeWorld', { 'x': deltaX, 'y': deltaY, 'world': this });
  };

  /**
   * Center the viewport around a specific location (x, y).
   */
  this.centerViewportAround = function(x, y) {
    var newXOffset = Math.min(this.width - canvas.width, Math.max(0, x - canvas.width / 2)) | 0,
        newYOffset = Math.min(this.height - canvas.height, Math.max(0, y - canvas.height/ 2)) | 0,
        deltaX = this.xOffset - newXOffset,
        deltaY = this.yOffset - newYOffset;
    this.xOffset = newXOffset;
    this.yOffset = newYOffset;
    context.translate(deltaX, deltaY);
  };

  /**
   * Determine whether a Box is inside the viewport.
   *
   * @param box
   *   The Box object to check for visibility.
   * @param partial
   *   (Optional) A boolean indicating whether to consider the Box inside the
   *   viewport if it is only partially inside. Defaults to false (the box must
   *   be fully inside to be considered "in view").
   *
   * @return
   *   true if the Box is inside the viewport; false otherwise.
   *
   * @see isInWorld()
   */
  this.isInView = function(box, partial) {
    if (partial) {
      return box.x + box.width > this.xOffset &&
        box.x < this.xOffset + canvas.width &&
        box.y + box.height > this.yOffset &&
        box.y < this.yOffset + canvas.height;
    }
    return box.x > this.xOffset &&
      box.x + box.width < this.xOffset + canvas.width &&
      box.y > this.yOffset &&
      box.y + box.height < this.yOffset + canvas.height;
  };

  /**
   * Determine whether a Box is inside the world.
   *
   * @param box
   *   The Box object to check.
   * @param partial
   *   (Optional) A boolean indicating whether to consider the box inside the
   *   world if it is only partially inside. Defaults to false (the box must be
   *   fully inside to be considered in the world).
   *
   * @return
   *   true if the Box is inside the world; false otherwise.
   *
   * @see isInView()
   */
  this.isInWorld = function(box, partial) {
    if (partial) {
      return box.x + box.width >= 0 && box.x <= world.width &&
        box.y + box.height >= 0 && box.y <= world.height;
    }
    return box.x >= 0 && box.x + box.width <= world.width &&
      box.y >= 0 && box.y + box.height <= world.height;
  };
}

/**
 * The Layer object (basically a new, utility canvas).
 *
 * Layers allow efficient rendering of complex scenes by acting as caches for
 * parts of the scene that are grouped together. For example, it is recommended
 * to create a layer for your canvas's background so that you can render the
 * background once and then draw the completely rendered background onto the
 * main canvas in each frame instead of re-computing the background for each
 * frame. This can significantly speed up animation.
 *
 * In general you should create a layer for any significant grouping of items
 * that must be drawn on the canvas if that grouping moves together when
 * animated. It is more memory-efficient to specify a smaller layer size if
 * possible; otherwise the layer will default to the size of the whole canvas.
 *
 * Draw onto a Layer by using its "context" property, which is a canvas
 * graphics context.
 *
 * @param options
 *   A hash of options (all optional):
 *   - x: The x-coordinate of the top-left corner of the Layer. Defaults to 0
 *     (zero).
 *   - y: The y-coordinate of the top-left corner of the Layer. Defaults to 0
 *     (zero).
 *   - width: The width of the Layer. Defaults to the main canvas width.
 *   - height: The height of the Layer. Defaults to the main canvas height.
 *   - relative: One of the following strings, indicating what to draw the
 *     Layer relative to:
 *     - 'world': Draw the layer relative to the world so that it will appear
 *       to be in one specific place as the player or viewport moves.
 *     - 'canvas': Draw the layer relative to the canvas so that it stays fixed
 *       as the player moves. This is useful for a HUD, for example.
 *     This option is irrelevant if the world is the same size as the canvas.
 *     Defaults to "world."
 *   - opacity: A fractional percentage [0, 1] indicating the opacity of the
 *     Layer. 0 (zero) means fully transparent; 1 means fully opaque. This
 *     value is applied when draw()ing the layer. Defaults to 1.
 *   - parallax: A fractional percentage indicating how much to scroll() the
 *     Layer relative to the viewport's movement. Defaults to 1.
 *   - src: Anything that can be passed to the "src" parameter of drawImage();
 *     this will be used to draw an image stretched over the whole Layer.
 *   - canvas: A Canvas element in which to hold the Layer. If not specified,
 *     a new, invisible canvas is created. Careful; if width and height are
 *     specified, the canvas will be resized (and therefore cleared). This is
 *     mainly for internal use.
 */
function Layer(options) {
  options = options || {};
  this.canvas = options.canvas || document.createElement('canvas');
  this.context = this.canvas.getContext('2d'); // Use this to draw onto the Layer
  this.width = options.width || world.width || canvas.width;
  this.height = options.height || world.height || canvas.height;
  this.x = options.x || 0;
  this.y = options.y || 0;
  this.relative = options.relative || 'world';
  this.opacity = options.opacity || 1;
  this.parallax = options.parallax || 1;
  this.canvas.width = this.width;
  this.canvas.height = this.height;
  this.xOffset = 0;
  this.yOffset = 0;
  if (options.src) {
    this.context.drawImage(options.src, 0, 0, this.width, this.height);
  }
  /**
   * Draw the Layer.
   *
   * This method can be invoked in two ways:
   * - draw(x, y)
   * - draw(ctx, x, y)
   *
   * All parameters are optional either way.
   *
   * @param ctx
   *   (Optional) A canvas graphics context onto which this Layer should be
   *   drawn. This is useful for drawing onto other Layers. If not specified,
   *   defaults to the global context for the default canvas.
   * @param x
   *   (Optional) An x-coordinate on the canvas specifying where to draw the
   *   upper-left corner of the Layer. The actual position that the coordinate
   *   equates to depends on the value of the Layer's "relative" property.
   *   Defaults to the Layer's "x" property (which defaults to 0 [zero]).
   * @param y
   *   (Optional) A y-coordinate on the canvas specifying where to draw the
   *   upper-left corner of the Layer. The actual position that the coordinate
   *   equates to depends on the value of the Layer's "relative" property.
   *   Defaults to the Layer's "y" property (which defaults to 0 [zero]).
   */
  this.draw = function(ctx, x, y) {
    if (!(ctx instanceof CanvasRenderingContext2D)) {
      y = x;
      x = ctx;
      ctx = context;
    }
    x = typeof x === 'undefined' ? this.x : x;
    y = typeof y === 'undefined' ? this.y : y;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    if (this.relative == 'canvas') {
      ctx.translate(world.xOffset, world.yOffset);
    }
    if (this.xOffset || this.yOffset) {
      ctx.translate(this.xOffset, this.yOffset);
    }
    ctx.drawImage(this.canvas, x, y);
    ctx.restore();
  };
  /**
   * Clear the layer, optionally by filling it with a given style.
   */
  this.clear = function(fillStyle) {
    this.context.clear(fillStyle);
  };
  /**
   * Scroll the Layer.
   *
   * @param x
   *   The horizontal distance the target has shifted.
   * @param y
   *   The vertical distance the target has shifted.
   * @param p
   *   (Optional) The parallax factor. Defaults to this.parallax.
   */
  this.scroll = function(x, y, p) {
    p = p || this.parallax;
    this.xOffset += -x*p;
    this.yOffset += -y*p;
    //this.context.translate(-x*p, -y*p);
  };
  /**
   * Display this Layer's canvas in an overlay (for debugging purposes).
   */
  this.showCanvasOverlay = function() {
    stopAnimating();
    $d = jQuery('<div></div>');
    $d.css({
      display: 'block',
      height: '100%',
      left: 0,
      position: 'absolute',
      top: 0,
      width: '100%',
    });
    $c = jQuery(this.canvas);
    $c.css({
      border: '1px solid black',
      display: 'block',
      margin: '0 auto',
      position: 'absolute',
      'z-index': 100,
    }).click(function() {
      $d.remove();
      startAnimating();
    });
    $d.append($c);
    jQuery('body').append($d);
  };
}

/**
 * Actors are Boxes that can move.
 */
var Actor = Box.extend({

  /**
   * The velocity the Actor can move in pixels per second.
   */
  MOVEAMOUNT: 400,

  /**
   * Whether gravity (downward acceleration) is enabled.
   *
   * This is effectively a toggle between a top-down and side view.
   */
  GRAVITY: false,

  /**
   * Gravitational acceleration in pixels per second-squared.
   *
   * Has no effect if GRAVITY is false. Setting to 0 (zero) has a similar
   * physical effect to disabling gravity.
   */
  G_CONST: 1500,

  /**
   * Jump velocity in pixels per second.
   *
   * Has no effect if GRAVITY is false. Set to 0 (zero) to disable jumping.
   */
  JUMP_VEL: 800,

  /**
   * The minimum number of milliseconds required between jumps.
   *
   * Has no effect if GRAVITY is false or JUMP_VEL is 0 (zero).
   */
  JUMP_DELAY: 250,

  /**
   * Percent of normal horizontal velocity Actors can move while in the air.
   *
   * Note that if Actors are moving horizontally before jumping, they keep
   * moving at the same speed in the air; in this case air control only takes
   * effect if they switch direction mid-air. Otherwise, air control only
   * applies if they started moving horizontally after they entered the air.
   */
  AIR_CONTROL: 0.25,

  /**
   * Whether to require that the jump key is released before jumping again.
   *
   * Specifically, this is a boolean which, when true, restricts the Actor from
   * jumping after being in the air until after the Actor is on the ground with
   * the jump key released. This limits the ability to "bounce" by holding down
   * the jump key. This behavior depends on being notified of when keys are
   * released via the release() method, which happens automatically for
   * Players. If you enable this for standard Actors, the meaning of a "key
   * press" is artificial, so you must make sure to call release() before you
   * make the Actor jump again.
   */
  JUMP_RELEASE: false,

  /**
   * The number of times an Actor can jump without touching the ground.
   *
   * -1 allows the Actor to jump in the air an infinite number of times. A
   * value of zero is the same as a value of one (i.e. a value of zero will not
   * stop the Actor from having one jump).
   */
  MULTI_JUMP: 0,

  /**
   * Whether to make the Actor continue moving in the last direction specified.
   */
  CONTINUOUS_MOVEMENT: false,

  /**
   * Whether the Actor will be restricted to not move outside the world.
   */
  STAY_IN_WORLD: true,

  // Dynamic (mostly internal) variables
  speed: 0, // Vertical velocity when gravity is on
  lastJump: 0, // Time when the last jump occurred in milliseconds since the epoch
  lastDirection: [], // The last direction (i.e. key press) passed to move()
  lastLooked: [], // The last direction (i.e. key press) that resulted in looking in a direction
  jumpDirection: {right: false, left: false}, // Whether the Actor was moving horizontally before jumping
  jumpKeyDown: false, // Whether the jump key is currently pressed
  numJumps: 0, // Number of jumps since the last time the Actor was touching the ground
  inAir: false, // Whether the Actor is in the air
  fallLeft: null, // The direction the Actor was moving before falling
  isBeingDragged: false, // Whether the Actor is being mouse-dragged
  velocity: 0,
  radialDirection: 0,
  acceleration: 0,
  accelDirection: 0,

  /**
   * Initialize an Actor.
   */
  init: function() {
    this._super.apply(this, arguments);
    this.lastDirection = [];
    this.lastLooked = [];
    this.jumpDirection = {right: false, left: false};
  },

  /**
   * Actors draw as a smiley face by default.
   */
  drawDefault: function(ctx, x, y, w, h) {
    context.drawSmiley(x + w/2, y + h/2, (w+h)/4);
  },

  /**
   * Update the Actor every cycle.
   *
   * @param direction
   *   An array of directions in which to move the Actor. Directions are
   *   expected to correspond to keys on the keyboard (as described by
   *   jQuery.hotkeys).
   *
   * @return
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   the Actor has moved in the respective direction.
   */
  update: function(direction) {
    if (this.isBeingDragged) {
      var mcx = mouse.coords.x + world.xOffset - this.width/2,
          mcy = mouse.coords.y + world.yOffset - this.height/2;
      var moved = {x: mcx - this.x, y: mcy - this.y};
      this.x = mcx;
      this.y = mcy;
      return moved;
    }
    var moveAmount = this.MOVEAMOUNT * App.timer.lastDelta;
    var moved = this.move(direction);
    // Gravity.
    if (this.GRAVITY) {
      var moveStep = this.speed * App.timer.lastDelta;
      this.speed += this.G_CONST * App.timer.lastDelta;
      // Air movement (not air control) but make sure we stay inside the world.
      if (this.isInAir() &&
          (this.y + this.height + moveStep <= world.height || !this.STAY_IN_WORLD)) {
        this.y += moveStep;
        moved.y += moveStep;
        if (this.jumpDirection.left &&
            (this.x - moveAmount >= 0 || !this.STAY_IN_WORLD)) {
          this.x -= moveAmount;
          moved.x -= moveAmount;
        }
        else if (this.jumpDirection.right &&
            (this.x + this.width + moveAmount <= world.width || !this.STAY_IN_WORLD)) {
          this.x += moveAmount;
          moved.x += moveAmount;
        }
      }
      else {
        this.stopFalling();
      }
      if (moved.x == 0) {
        this.fallLeft = null;
      }
    }
    this.updateAnimation(moved);
    return moved;
  },

  /**
   * Moves the Actor in a given direction.
   *
   * @param direction
   *   An array of directions in which to move the Actor. Directions are
   *   expected to correspond to keys on the keyboard (as described by
   *   jQuery.hotkeys).
   *
   * @return
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   the Actor has moved in the respective direction.
   *
   * @see Actor.update()
   */
  move: function(direction) {
    var moveAmount = this.MOVEAMOUNT * App.timer.lastDelta,
        left = false,
        right = false,
        looked = false,
        anyIn = App.Utils.anyIn;
    var moved = {
      x: 0,
      y: 0,
    };
    // Bail if someone deleted the keys variable.
    if (typeof keys == 'undefined') {
      return moved;
    }
    if (typeof direction == 'undefined' || direction.length == 0) {
      // For continuous movement, if no direction is given, use the last one.
      if (this.CONTINUOUS_MOVEMENT) {
        direction = this.lastLooked;
      }
      // No need to keep processing if no directions were given.
      else {
        return moved;
      }
    }
    this.lastDirection = direction.slice(); // shallow copy

    // Move left.
    if (anyIn(keys.left, direction) &&
        (this.x - moveAmount >= 0 || !this.STAY_IN_WORLD)) {
      left = true;
      looked = true;
      this.fallLeft = true;
      if (this.GRAVITY && this.isInAir()) {
        if (this.jumpDirection.right || !this.jumpDirection.left) {
          this.x -= moveAmount * this.AIR_CONTROL;
          moved.x -= moveAmount * this.AIR_CONTROL;
          this.jumpDirection.right = false;
          this.jumpDirection.left = false;
        }
      }
      else {
        this.x -= moveAmount;
        moved.x -= moveAmount;
      }
    }
    // Move right.
    else if (anyIn(keys.right, direction) &&
        (this.x + this.width + moveAmount <= world.width || !this.STAY_IN_WORLD)) {
      right = true;
      looked = true;
      this.fallLeft = false;
      if (this.GRAVITY && this.isInAir()) {
        if (this.jumpDirection.left || !this.jumpDirection.right) {
          this.x += moveAmount * this.AIR_CONTROL;
          moved.x += moveAmount * this.AIR_CONTROL;
          this.jumpDirection.right = false;
          this.jumpDirection.left = false;
        }
      }
      else {
        this.x += moveAmount;
        moved.x += moveAmount;
      }
    }

    // Move up / jump.
    if (anyIn(keys.up, direction) &&
        (this.y - moveAmount >= 0 || !this.STAY_IN_WORLD)) {
      if (!this.GRAVITY) {
        this.y -= moveAmount;
        moved.y -= moveAmount;
        looked = true;
      }
      else if (!this.isInAir() ||
          this.MULTI_JUMP > this.numJumps ||
          this.MULTI_JUMP == -1) {
        var now = Date.now();
        if (now - this.lastJump > this.JUMP_DELAY && // sufficient delay
            (!this.JUMP_RELEASE || !this.jumpKeyDown)) { // press jump again
          this.speed = -this.JUMP_VEL;
          this.lastJump = now;
          this.jumpDirection.right = right;
          this.jumpDirection.left = left;
          this.numJumps++;
          this.inAir = true;
        }
      }
      this.jumpKeyDown = true;
    }
    // Move down.
    else if (anyIn(keys.down, direction) &&
        (this.y + this.height + moveAmount <= world.height || !this.STAY_IN_WORLD)) {
      if (!this.isInAir() || !this.GRAVITY) { // don't allow accelerating downward when falling
        this.y += moveAmount;
        moved.y += moveAmount;
        looked = true;
      }
    }

    if (looked) {
      this.lastLooked = direction.slice(); // shallow copy
      // Avoid looking anywhere but right or left if gravity is enabled.
      // If we didn't have this here, we would be able to look diagonally.
      if (this.GRAVITY) {
        for (var i = this.lastLooked.length-1; i >= 0; i--) {
          if (keys.left.indexOf(this.lastLooked[i]) == -1 &&
              keys.right.indexOf(this.lastLooked[i]) == -1) {
            this.lastLooked.splice(i, 1);
          }
        }
      }
    }
    return moved;
  },

  /**
   * Moves this Actor outside of another Box so that it no longer overlaps.
   *
   * @param other
   *   The other Box that this Actor should be moved outside of.
   *
   * @return
   *   An object with 'x' and 'y' properties indicating how far this Actor
   *   moved in order to be outside of the other Box, in pixels.
   *
   * @see collideSolid()
   * @see moveOutsideX()
   * @see moveOutsideY()
   */
  moveOutside: function(other) {
    var overlapsX = Math.min(this.x + this.width - other.x, other.x + other.width - this.x),
        overlapsY = Math.min(this.y + this.height - other.y, other.y + other.height - this.y);

    // It matters which axis we move first.
    if (overlapsX <= overlapsY) {
      return {
        x: this.moveOutsideX(other),
        y: this.moveOutsideY(other),
      };
    }
    return {
      y: this.moveOutsideY(other),
      x: this.moveOutsideX(other),
    };
  },

  /**
   * Moves this Actor outside of another Box on the x-axis to avoid overlap.
   *
   * @param other
   *   The other Box that this Actor should be moved outside of.
   *
   * @return
   *   The distance in pixels that this Actor moved on the x-axis.
   *
   * @see moveOutside()
   */
  moveOutsideX: function(other) {
    var moved = 0;
    // Only adjust if we're intersecting
    if (this.overlaps(other)) {
      // If our center is left of their center, move to the left side
      if (this.x + this.width / 2 < other.x + other.width / 2) {
        var movedTo = other.x - this.width - 1;
        moved = movedTo - this.x;
        this.x = movedTo;
      }
      // If our center is right of their center, move to the right side
      else {
        var movedTo = other.x + other.width + 1;
        moved = movedTo - this.x;
        this.x = movedTo;
      }
    }
    return moved;
  },

  /**
   * Moves this Actor outside of another Box on the y-axis to avoid overlap.
   *
   * @param other
   *   The other Box that this Actor should be moved outside of.
   *
   * @return
   *   The distance in pixels that this Actor moved on the y-axis.
   *
   * @see moveOutside()
   */
  moveOutsideY: function(other) {
    var moved = 0;
    // Only adjust if we're intersecting
    if (this.overlaps(other)) {
      // If our center is above their center, move to the top
      if (this.y + this.height / 2 <= other.y + other.height / 2) {
        var movedTo = other.y - this.height - 1;
        moved = movedTo - this.y;
        this.y = movedTo;
      }
      // If our center is below their center, move to the bottom
      else {
        var movedTo = other.y + other.height + 1;
        moved = movedTo - this.y;
        this.y = movedTo;
      }
    }
    return moved;
  },

  /**
   * Start falling.
   *
   * This method has no meaning if GRAVITY is false.
   *
   * @see stopFalling()
   * @see isInAir()
   * @see isJumping()
   * @see isFalling()
   * @see hasAirMomentum()
   */
  startFalling: function() {
    // Keep going at the same horizontal speed when walking off a ledge.
    if (!this.inAir && this.fallLeft !== null) {
      this.jumpDirection.left = this.fallLeft;
      this.jumpDirection.right = !this.fallLeft;
    }
    this.inAir = true;
  },

  /**
   * Notify the Actor that it has landed.
   *
   * This method has no meaning if GRAVITY is false.
   *
   * @see startFalling()
   * @see isInAir()
   * @see isJumping()
   * @see isFalling()
   * @see hasAirMomentum()
   */
  stopFalling: function() {
    if (this.y + this.height + this.speed * App.timer.lastDelta > world.height &&
        this.STAY_IN_WORLD) {
      this.y = world.height - this.height;
    }
    if (this.speed > 0) {
      this.speed = 0;
    }
    this.numJumps = 0;
    this.inAir = false;
  },

  /**
   * Check whether the Actor is in the air or not.
   *
   * @see startFalling()
   * @see stopFalling()
   * @see isJumping()
   * @see isFalling()
   * @see hasAirMomentum()
   */
  isInAir: function() {
    return this.inAir;
  },

  /**
   * Check whether the Actor is jumping or not.
   *
   * @see startFalling()
   * @see stopFalling()
   * @see isInAir()
   * @see isFalling()
   * @see hasAirMomentum()
   */
  isJumping: function() {
    return this.numJumps > 0;
  },

  /**
   * Check whether the Actor is in the air from falling (as opposed to jumping).
   *
   * @see startFalling()
   * @see stopFalling()
   * @see isInAir()
   * @see isJumping()
   * @see hasAirMomentum()
   */
  isFalling: function() {
    return this.isInAir() && this.numJumps == 0;
  },

  /**
   * Check whether the Actor has air momentum (as opposed to air control).
   *
   * @see startFalling()
   * @see stopFalling()
   * @see isInAir()
   * @see isJumping()
   * @see isFalling()
   */
  hasAirMomentum: function() {
    return this.fallLeft != null ||
      this.jumpDirection.left ||
      this.jumpDirection.right;
  },

  /**
   * Check whether this Actor is standing on top of the box.
   */
  standingOn: function(box) {
    if (box instanceof Collection || box instanceof TileMap) {
      var items = box.getAll();
      for (var i = 0, l = items.length; i < l; i++) {
        if (this.standingOn(items[i])) {
          return true;
        }
      }
      return false;
    }
    return this.overlapsX(box) &&
      App.Utils.almostEqual(this.y + this.height, box.y, 1);
  },

  /**
   * Check collision with solids and adjust the Actor's position as necessary.
   *
   * @param moved
   *   An object with 'x' and 'y' properties indicating the distance in pixels
   *   that the Actor moved since the last repaint.
   * @param collideWith
   *   A Box, Collection, or TileMap of objects with which to check collision.
   *
   * @return
   *   true if the Actor collided with something; false otherwise.
   */
  collideSolid: function(moved, collideWith) {
    var falling = this.GRAVITY &&
        (this.y + this.height != world.height || !this.STAY_IN_WORLD);
    var result = {}, collided = false;
    if (collideWith instanceof Box) {
      result = this._collideSolidBox(moved, collideWith);
      falling = result.falling;
      collided = result.collided;
    }
    else if (collideWith instanceof Collection || collideWith instanceof TileMap) {
      var items = collideWith.getAll();
      for (var i = 0, l = items.length; i < l; i++) {
        result = this._collideSolidBox(moved, items[i]);
        if (!result.falling) {
          falling = false;
        }
        if (result.collided) {
          collided = true;
        }
      }
    }
    // If the Actor isn't standing on a solid, it needs to start falling.
    if (falling) {
      this.startFalling();
    }
    return collided;
  },

  /**
   * Check collision with a single solid and adjust the Actor's position.
   *
   * @param moved
   *   An object with 'x' and 'y' properties indicating the distance in pixels
   *   that the Actor moved since the last repaint.
   * @param collideWith
   *   A Box with which to check collision.
   *
   * @return
   *   An object with 'falling' and 'collided' properties (both Booleans
   *   indicating whether the Actor is falling or has collided with a solid).
   *
   * @see collideSolid()
   */
  _collideSolidBox: function(moved, collideWith) {
    // "Falling" here really just means "not standing on top of this Box."
    var falling = true, collided = false;
    // If we moved a little too far and now intersect a solid, back out.
    if (this.overlaps(collideWith)) {
      this.moveOutside(collideWith);
      collided = true;
    }
    // If gravity is on, check standing/falling behavior.
    if (this.GRAVITY) {
      // We actually want to check if the last X-position would have been
      // standing, so move back there, check, and then move back to the current
      // position. This is because if a player jumps while moving towards a
      // wall, they could match the standing condition as they just barely
      // reach the top, which will stop their jump arc. If their x-position
      // from the last frame would have been standing, though, we can assume
      // they were already standing rather than jumping.
      this.x -= moved.x;
      if (this.standingOn(collideWith)) {
        this.stopFalling();
        falling = false;
      }
      this.x += moved.x;
      // If we're in the air and we hit something, stop the momentum.
      if (falling && collided) {
        // If we hit the bottom, stop rising.
        if (App.Utils.almostEqual(this.y, collideWith.y + collideWith.height, 1)) {
          if (this.speed < 0) {
            this.speed = 0;
          }
        }
        // If we hit a side, stop horizontal momentum.
        else {
          this.fallLeft = null;
          this.jumpDirection.left = false;
          this.jumpDirection.right = false;
        }
      }
    }
    return {falling: falling, collided: collided};
  },

  /**
   * Check whether the movement made during this frame was allowed.
   *
   * This is useful for making sure Actors can't walk through walls if the
   * frame rate drops dramatically or they're going really fast.
   *
   * @param moved
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   the Actor has moved along each axis.
   * @param collideWith
   *   A Box, Collection, or TileMap indicating the solid object(s) with which
   *   to check for collision.
   * @param fix
   *   A boolean indicating whether or not to correct the move if it is not
   *   allowed. Defaults to false.
   *
   * @return
   *   true if the move is allowed; false otherwise.
   */
  isMoveAllowed: function(moved, collideWith, fix) {
    if (collideWith instanceof Box) {
      if (moved.x) {
        // Check whether we moved through the box horizontally
        // (We were on one side of it, and now we're on the other side)
        if (this.x - collideWith.x - collideWith.width >= Math.min(moved.x, 0) &&
            this.x + this.width - collideWith.x <= Math.max(moved.x, 0)) {
          // Check whether we are/were at the right vertical position to collide at all
          if (this.y - collideWith.y - collideWith.height <= Math.min(moved.y, 0) &&
              this.y + this.height - collideWith.y >= Math.max(moved.y, 0)) {
            if (fix) {
              // Interpolate y-position
              moved.y /= 2;
              this.y -= moved.y;
              // Adjust x-position to flush with box
              var x = this.x;
              this.x = moved.x > 0 ? collideWith.x - this.width : collideWith.x + collideWith.width;
              moved.x = this.x - x;
            }
            return false;
          }
        }
      }
      if (moved.y) {
        // Check whether we moved through the box vertically
        // (We were on one side of it, and now we're on the other side)
        if (this.y - collideWith.y - collideWith.height >= Math.min(moved.y, 0) &&
            this.y + this.height - collideWith.y <= Math.max(moved.y, 0)) {
          // Check whether we are/were at the right horizontal position to collide at all
          if (this.x - collideWith.x - collideWith.width <= Math.min(moved.x, 0) &&
              this.x + this.width - collideWith.x >= Math.max(moved.x, 0)) {
            if (fix) {
              // Interpolate x-position
              moved.x /= 2;
              this.x -= moved.x;
              // Adjust y-position to flush with box
              var y = this.y;
              this.y = moved.y > 0 ? collideWith.y - this.height : collideWith.y + collideWith.height;
              moved.y = this.y - y;
            }
            return false;
          }
        }
      }
    }
    else if (collideWith instanceof Collection || collideWith instanceof TileMap) {
      var items = collideWith.getAll();
      for (var i = 0, l = items.length; i < l; i++) {
        if (!this.isMoveAllowed(moved, items[i], fix)) {
          return false;
        }
      }
    }
    return true;
  },

  /**
   * Change the Actor's animation sequence if it uses a SpriteMap.
   *
   * All animations fall back to the "stand" animation if they are not
   * available. The "jumpRight" and "jumpLeft" sequences will try to fall back
   * to the "lookRight" and "lookLeft" sequences first, respectively, if they
   * are not available. Animations that will play by default if they are
   * available include:
   * - stand (required)
   * - left
   * - right
   * - up
   * - down
   * - upRight
   * - upLeft
   * - downRight
   * - downLeft
   * - jump
   * - fall
   * - jumpRight
   * - jumpLeft
   * - lookRight
   * - lookLeft
   * - lookUp
   * - lookDown
   * - lookUpRight
   * - lookUpLeft
   * - lookDownRight
   * - lookDownLeft
   *
   * Override this function if you want to modify the custom rules for which
   * animations to play (or what the animations' names are).
   *
   * This function does nothing if the Actor's "src" attribute is not a
   * SpriteMap.
   *
   * @param moved
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   the Actor has moved along each axis.
   *
   * @see useAnimation()
   */
  updateAnimation: function(moved) {
    if (!(this.src instanceof SpriteMap)) {
      return;
    }
    var lastDirection = this.lastDirection;
    // Don't let shooting make us change where we're looking.
    if (typeof keys.shoot != 'undefined' && App.Utils.anyIn(keys.shoot, lastDirection)) {
      lastDirection = this.lastLooked;
    }
    if (this.isBeingDragged) {
      this.useAnimation('drag', 'stand');
    }
    else if (this.isInAir()) {
      if (moved.x > 0) {
        this.useAnimation('jumpRight', 'lookRight', 'stand');
      }
      else if (moved.x < 0) {
        this.useAnimation('jumpLeft', 'lookLeft', 'stand');
      }
      else if (this.isJumping()) {
        this.useAnimation('jump', 'stand');
      }
      else {
        this.useAnimation('fall', 'stand');
      }
    }
    else if (moved.y > 0) {
      if (moved.x > 0) {
        this.useAnimation('downRight', 'stand');
      }
      else if (moved.x < 0) {
        this.useAnimation('downLeft', 'stand');
      }
      else {
        this.useAnimation('down', 'stand');
      }
    }
    else if (moved.y < 0) {
      if (moved.x > 0) {
        this.useAnimation('upRight', 'stand');
      }
      else if (moved.x < 0) {
        this.useAnimation('upLeft', 'stand');
      }
      else {
        this.useAnimation('up', 'stand');
      }
    }
    else if (moved.x > 0) {
      this.useAnimation('right', 'stand');
    }
    else if (moved.x < 0) {
      this.useAnimation('left', 'stand');
    }
    else if (App.Utils.anyIn(keys.up, lastDirection)) {
      if (App.Utils.anyIn(keys.right, lastDirection)) {
        this.useAnimation('lookUpRight', 'stand');
      }
      else if (App.Utils.anyIn(keys.left, lastDirection)) {
        this.useAnimation('lookUpLeft', 'stand');
      }
      else {
        this.useAnimation('lookUp', 'stand');
      }
    }
    else if (App.Utils.anyIn(keys.down, lastDirection)) {
      if (App.Utils.anyIn(keys.right, lastDirection)) {
        this.useAnimation('lookDownRight', 'stand');
      }
      else if (App.Utils.anyIn(keys.left, lastDirection)) {
        this.useAnimation('lookDownLeft', 'stand');
      }
      else {
        this.useAnimation('lookDown', 'stand');
      }
    }
    else if (App.Utils.anyIn(keys.right, lastDirection)) {
      this.useAnimation('lookRight', 'stand');
    }
    else if (App.Utils.anyIn(keys.left, lastDirection)) {
      this.useAnimation('lookLeft', 'stand');
    }
    else {
      this.useAnimation('stand');
    }
  },

  /**
   * Try to switch to a different SpriteMap animation sequence.
   *
   * Takes animation sequence names as arguments as switches to the first named
   * sequence that exists in the SpriteMap. If you already know what animation
   * sequences you have available, you might as well just call this.src.use()
   * directly.
   *
   * @return
   *   The name of the animation sequence to which the Actor switched, if
   *   successful; false otherwise.
   *
   * @see updateAnimation()
   */
  useAnimation: function() {
    for (var i = 0; i < arguments.length; i++) {
      var a = arguments[i];
      if (this.src.maps[a]) {
        this.src.use(a);
        return a;
      }
    }
    return false;
  },

  /**
   * Toggle whether the Actor can be dragged around by the mouse.
   *
   * Be careful with this. By default, Actors are still subject to all the same
   * behavioral rules. If you try to drag an Actor that is restricted to one
   * axis, it will still only move along that axis. Collision still applies,
   * but you may find that collision doesn't quite work the way you think it
   * does.
   */
  setDraggable: function(on) {
    if (!on) {
      this.unlisten('.drag');
      $canvas.off('.drag');
      return;
    }
    if (this.isBeingDragged) {
      return;
    }
    this.listen('mousedown.drag touchstart.drag', function() {
      this.isBeingDragged = true;
      jQuery(document).trigger('canvasdragstart', this);
    });
    var t = this;
    $canvas.on('mouseup.drag touchend.drag', function() {
      t.isBeingDragged = false;
      jQuery(document).trigger('canvasdragstop', t);
    });
  },

  /**
   * Notify the Actor that a direction is no longer being given.
   *
   * This is useful when Actors need to distinguish between directions being
   * given continuously (such as when holding down a key) and those being given
   * intermittently (such as a simple key press).
   *
   * @param releasedDirections
   *   An array containing directions that are no longer being given.
   */
  release: function(releasedDirections) {
    if (this.GRAVITY && typeof keys != 'undefined' &&
        App.Utils.anyIn(keys.up, releasedDirections)) {
      this.jumpKeyDown = false;
    }
  },
});

/**
 * The Player object controlled by the user.
 *
 * If the world is bigger than the canvas, the viewport will shift as a Player
 * moves toward an edge of the viewport. This behavior is usually desirable for
 * situations where a Player is desired, and in other cases (e.g. when the
 * viewport should shift based on the mouse's location) generally a Player
 * should not be used.
 */
var Player = Actor.extend({
  /**
   * The default threshold for how close a Player has to be to an edge before
   * the viewport shifts (in percent of canvas size). To have the viewport move
   * only when the Player is actually at its edge, try a value close to zero.
   * To have the viewport move with the Player, try a value close to 0.5.
   */
  MOVEWORLD: 0.45,

  /**
   * Whether to require that the jump key is released before jumping again.
   *
   * Specifically, this is a boolean which, when true, restricts the Actor from
   * jumping after being in the air until after the Actor is on the ground with
   * the jump key released. This limits the ability to "bounce" by holding down
   * the jump key. This behavior depends on being notified of when keys are
   * released via the release() method, which happens automatically for
   * Players. If you enable this for standard Actors, the meaning of a "key
   * press" is artificial, so you must make sure to call release() before you
   * make the Actor jump again.
   */
  JUMP_RELEASE: true,

  /**
   * Initialize a Player.
   */
  init: function() {
    this._super.apply(this, arguments);
    if (arguments.length > 0) {
      world.centerViewportAround(this.x, this.y);
    }
    var t = this;
    // Notify the Player object when keys are released.
    jQuery(document).on('keyup.release', function() {
      t.release([jQuery.hotkeys.lastKeyPressed()]);
    });
  },

  /**
   * Override Actor.move() to respond to keyboard input automatically.
   */
  move: function(direction) {
    if (direction === undefined) {
      direction = jQuery.hotkeys.keysDown;
    }
    return this._super(direction);
  },

  /**
   * Override Actor.update() to move the viewport as the Player nears an edge.
   */
  update: function(direction) {
    var moved = this._super(direction);
    if (!this.isBeingDragged) {
      this.adjustViewport(moved);
    }
    return moved;
  },

  /**
   * Toggle whether the Player can be dragged around by the mouse.
   */
  setDraggable: function(on) {
    if (!on) {
      this.unlisten('.drag');
      $canvas.off('.drag');
      return;
    }
    if (this.isBeingDragged) {
      return;
    }
    this.listen('mousedown.drag touchstart.drag', function() {
      this.isBeingDragged = true;
      jQuery(document).trigger('canvasdragstart', this);
    });
    var t = this;
    $canvas.on('mouseup.drag touchend.drag', function() {
      t.isBeingDragged = false;
      jQuery(document).trigger('canvasdragstop', t);
      world.centerViewportAround(t.x, t.y);
    });
  },

  /**
   * Move the viewport when the Player gets near the edge.
   *
   * @param moved
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   the Player has moved along each axis.
   *
   * @return
   *   An object with 'x' and 'y' properties indicating the number of pixels
   *   this method caused the viewport to shift along each axis.
   */
  adjustViewport: function(moved) {
    var offsets = world.getOffsets(), changed = {x: 0, y: 0};
    // We should only have mouse or player scrolling, but not both.
    if (mouse.scroll.isEnabled()) {
      return changed;
    }
    // left
    if (offsets.x > 0 && this.x + this.width/2 - offsets.x < canvas.width * this.MOVEWORLD) {
      world.xOffset = Math.max(offsets.x + moved.x, 0);
      context.translate(offsets.x - world.xOffset, 0);
      changed.x = offsets.x - world.xOffset;
    }
    // right
    else if (offsets.x < world.width - canvas.width &&
        this.x + this.width/2 - offsets.x > canvas.width * (1-this.MOVEWORLD)) {
      world.xOffset = Math.min(offsets.x + moved.x, world.width - canvas.width);
      context.translate(offsets.x - world.xOffset, 0);
      changed.x = offsets.x - world.xOffset;
    }
    // up
    if (offsets.y > 0 && this.y + this.height/2 - offsets.y < canvas.height * this.MOVEWORLD) {
      world.yOffset = Math.max(offsets.y + moved.y, 0);
      context.translate(0, offsets.y - world.yOffset);
      changed.y = offsets.y - world.yOffset;
    }
    // down
    else if (offsets.y < world.height - canvas.height &&
        this.y + this.height/2 - offsets.y > canvas.height * (1-this.MOVEWORLD)) {
      world.yOffset = Math.min(offsets.y + moved.y, world.height - canvas.height);
      context.translate(0, offsets.y - world.yOffset);
      changed.y = offsets.y - world.yOffset;
    }
    return changed;
  },
});
