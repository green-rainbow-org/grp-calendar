import calendarCSS from './calendar.module.css';
import { LionCalendar } from "@lion/calendar";
import { html, reactive } from '@arrow-js/core';
import { arrowTags } from 'arrow-tags';

const toArrowCalendar = (data, globalCSS) => {

  class Calendar extends LionCalendar {

    constructor() {
      super();
      this.minDate = new Date();
      this.data = reactive(this.setup);
      this.mutate = new MutationObserver((records) => {
        this.limitDates();
        if (initialize_calendar(records)) return;
        const date = this.date?.toISOString() || null;
        data.setActiveDate(date);
      });
    }

    limitDates() {
      this.minDate = data.getMinDate() || new Date();
      this.maxDate = data.getMaxDate() || undefined;
    }

    static get setup() {
      return {
        phase: data.phase,
        date: data.getActiveDate('')
      };
    }

    static get observedAttributes() {
      const out = super.observedAttributes;
      return out.concat(Object.keys(Calendar.setup));
    }

    attributeChangedCallback(name, _, val) {
      super.attributeChangedCallback(name, _, val);
      if (name === 'date') {
        this.date = val ? new Date(val) : "";
      }
      else if (name === 'phase') {
        this.limitDates();
        const date = data.getActiveDate('');
        this.date = date ? new Date(date) : "";
      }
    }

    connectedCallback() {
      super.connectedCallback();
      const root = this.shadowRoot;
      root.adoptedStyleSheets = [
        globalCSS, calendarCSS
      ];
      this.mutate.observe(root, { 
        subtree: true, childList: true, attributes: true
      });
    }

    set date (date) {
      if (date === "") {
        this.selectedDate = undefined;
        return;
      };
      this.centralDate = date;
      this.selectedDate = date;
    }

    get date() {
      if (this.hasDate === false) return null;
      return this.centralDate;
    }

    get hasDate() {
      const central = this.centralDate;
      const selected = this.selectedDate;
      if (!central || !selected) return false;
      return selected.getTime() === central.getTime();
    }
  }
  return Calendar;
}

const toCalendar = (data, globalCSS) => {
  const ArrowCalendar = toArrowCalendar(data, globalCSS);
  return toTag('calendar', ArrowCalendar)``({ 
    date: d => d.getActiveDate(''),
    phase: d => d.phase,
    class: d => {
      if (!d.hasCalendar()) {
        return 'display-none';
      }
      return 'calendar';
    },
    data,
  });
}

const toTag = (key, customElement=null) => {
  if (customElement === null) {
    return arrowTags(html)[key];
  }
  const tag = `green-rainbow-${key}`;
  if (!customElements.get(tag)) {
    customElements.define(tag, customElement);
  }
  return arrowTags(html)[tag];
}

const classify = cal => {
  const target = 'calendar__navigation';
  const with_children = el => [el[0], ...el[0].children];
  const els = with_children(cal.getElementsByClassName(target));
  els.forEach(el => el.classList.add('centered'));
}

const initialize_calendar = records => {
  const cal = records.reduce((a, r) => {
    return [...a, ...r.addedNodes];
  }, []).find(a => a.className === 'calendar');
  if (cal !== undefined) classify(cal);
  return cal !== undefined;
}

export { toCalendar };
