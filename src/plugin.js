import document from 'global/document';
import videojs from 'video.js';
import guid from './guid.js';
import {version as VERSION} from '../package.json';

const dom = videojs.dom || videojs;
const registerPlugin = videojs.registerPlugin || videojs.plugin;
const Component = videojs.getComponent('Component');

/**
 * Title Component
 */
export class Title extends Component {
  constructor(player, options) {
    super(player, options);

    const tech = player.$('.vjs-tech');

    tech.setAttribute('aria-labelledby', this.title.id);
    tech.setAttribute('aria-describedby', this.producer.id);
  }

  createEl() {
    const title = dom.createEl('div', {
      className: 'vjs-dock-title',
      title: this.options_.title,
      innerHTML: this.options_.title
    }, {
      id: `vjs-dock-title-${guid()}`
    });
    const producer = dom.createEl('div', {
      className: 'vjs-dock-producer',
      title: this.options_.producer,
      innerHTML: this.options_.producer
    }, {
      id: `vjs-dock-producer-${guid()}`
    });
    const schedule = dom.createEl('div', {
      className: 'vjs-dock-schedule',
      title: this.options_.schedule,
      innerHTML: this.options_.schedule
    }, {
      id: `vjs-dock-schedule-${guid()}`
    });
    const el = super.createEl('div', {
      className: 'vjs-dock-text'
    });

    this.title = title;
    this.producer = producer;
    this.schedule = schedule;

    el.appendChild(title);
    el.appendChild(producer);
    el.appendChild(schedule);

    return el;
  }

  update(title, producer, schedule) {
    this.title.innerHTML = '';
    this.producer.innerHTML = '';
    this.schedule.innerHTML = '';

    this.title.appendChild(document.createTextNode(title));
    this.producer.appendChild(document.createTextNode(producer));
    this.schedule.appendChild(document.createTextNode(schedule));
  }
}

/**
 * Shelf Component
 */
export class Shelf extends Component {
  createEl() {
    return super.createEl('div', {
      className: 'vjs-dock-shelf'
    });
  }
}

videojs.registerComponent('Title', Title);
videojs.registerComponent('Shelf', Shelf);

/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function dock
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const dock = function(options) {
  const opts = options || {};
  const settings = {
    title: {
      title: opts.title || '',
      producer: opts.producer || '',
      schedule: opts.schedule || ''
    }
  };

  let title = this.title;
  let shelf = this.shelf;

  this.addClass('vjs-dock');

  // If dock is initalized as part of player options, the player won't be ready
  // and the dock items will be hidden by the poster image when it's created.
  // In those cases, wait for player ready.
  this.ready(() => {
    const bpbIndex = this.children().indexOf(this.getChild('bigPlayButton'));
    const index = bpbIndex > 0 ? bpbIndex - 1 : null;

    // add shelf first so `title` is added before it if available
    // because shelf will now be at index
    if (!shelf) {
      shelf = this.shelf = this.addChild('shelf', settings, index);
    }

    if (!title) {
      title = this.title = this.addChild('title', settings.title, index);
    } else {
      title.update(settings.title.title, settings.title.producer, settings.title.schedule);
    }

    this.one(title, 'dispose', function() {
      this.title = null;
    });

    this.one(shelf, 'dispose', function() {
      this.shelf = null;
    });

    // Update aria attributes to describe video content if title/producer
    // IDs and text content are present. If unavailable, accessibility
    // landmark can fall back to generic `Video Player` aria-label.
    const titleEl = title.title;
    const producerEl = title.producer;

    const titleId = titleEl.id;
    const producerId = producerEl.id;

    if (titleId && titleEl.textContent) {
      this.setAttribute('aria-labelledby', this.id() + ' ' + titleId);
    }

    if (producerId && producerEl.textContent) {
      this.setAttribute('aria-describedby', producerId);
    }
  }, true);
};

dock.VERSION = VERSION;

// Register the plugin with video.js.
registerPlugin('dock', dock);

export default dock;
