import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" [attr.stroke-width]="stroke" stroke-linecap="round" stroke-linejoin="round">
      @switch (name) {
        @case ('home') { <path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/> }
        @case ('building') { <rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1"/> }
        @case ('map') { <path d="M9 20 3 18V4l6 2 6-2 6 2v14l-6-2-6 2Z"/><path d="M9 6v14M15 4v14"/> }
        @case ('key') { <circle cx="8" cy="15" r="4"/><path d="M11 12 20 3M17 6l2 2M14 9l2 2"/> }
        @case ('briefcase') { <rect x="3" y="8" width="18" height="12" rx="1.5"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/> }
        @case ('hotel') { <path d="M3 21V8l9-5 9 5v13"/><path d="M9 21v-6h6v6M9 12h.01M15 12h.01M12 12h.01"/> }
        @case ('layers') { <path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5M3 8v5M21 8v5"/> }
        @case ('land') { <path d="M2 20h20"/><path d="m4 20 5-11 3 6 2-4 6 9"/><circle cx="18" cy="7" r="2"/> }
        @case ('search') { <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/> }
        @case ('heart') { <path d="M12 21s-7.5-4.6-10-9.1C.5 8.3 2 4.5 5.7 4c2-.3 3.7.7 4.7 2.2C11.4 4.7 13.1 3.7 15.1 4c3.7.5 5.2 4.3 3.7 7.9C16.5 16.4 12 21 12 21Z"/> }
        @case ('phone') { <path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2c-8 0-14-6-14-14a2 2 0 0 1 2-2Z"/> }
        @case ('mail') { <rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 6.5 8 6 8-6"/> }
        @case ('lock') { <rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/> }
        @case ('pin') { <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/> }
        @case ('bed') { <path d="M2 19v-6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v6"/><path d="M2 19h20M4 11V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M14 8h4a2 2 0 0 1 2 2v1"/> }
        @case ('bath') { <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3Z"/><path d="M7 12V6a2 2 0 0 1 3.5-1.3M3 12h18M8 21v1M16 21v1"/> }
        @case ('ruler') { <rect x="3" y="8" width="18" height="8" rx="1"/><path d="M7 8v3M11 8v3M15 8v3M19 8v3"/> }
        @case ('check') { <path d="M20 6 9 17l-5-5"/> }
        @case ('x') { <path d="m18 6-12 12M6 6l12 12"/> }
        @case ('filter') { <path d="M4 6h16M7 12h10M10 18h4"/> }
        @case ('chevronDown') { <path d="m6 9 6 6 6-6"/> }
        @case ('chevronLeft') { <path d="m15 6-6 6 6 6"/> }
        @case ('chevronRight') { <path d="m9 6 6 6-6 6"/> }
        @case ('plus') { <path d="M12 5v14M5 12h14"/> }
        @case ('edit') { <path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z"/> }
        @case ('trash') { <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0-.9 14a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6"/> }
        @case ('users') { <circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="18" cy="8" r="2.7"/><path d="M17 14.2c2.7.5 4.5 2.6 4.5 5.8"/> }
        @case ('clipboard') { <rect x="5" y="4" width="14" height="17" rx="1.5"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h6"/> }
        @case ('arrowUpRight') { <path d="M7 17 17 7M8 7h9v9"/> }
        @case ('logout') { <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/> }
        @case ('compass') { <circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-6 2 2-6 6-2Z"/> }
        @case ('sofa') { <path d="M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M3 10h18v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z"/><path d="M4 16v3M20 16v3"/> }
        @case ('car') { <path d="M4 16V9l2-4h12l2 4v7"/><path d="M2 16h20v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2Z"/><circle cx="7" cy="16" r="1.6"/><circle cx="17" cy="16" r="1.6"/> }
        @case ('shield') { <path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5l-8-3Z"/> }
        @case ('wifi') { <path d="M2 8.5a16 16 0 0 1 20 0M5.5 12a11 11 0 0 1 13 0M9 15.5a6 6 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/> }
        @case ('droplet') { <path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11Z"/> }
        @case ('dumbbell') { <path d="M6 7v10M18 7v10M2 10v4M22 10v4M6 12h12"/> }
        @case ('tree') { <path d="M12 2 7 10h3l-4 6h4v6h4v-6h4l-4-6h3L12 2Z"/> }
        @case ('eye') { <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/> }
        @case ('eyeOff') { <path d="M17.9 17.9A10.4 10.4 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 5.1-5.9M9.9 4.24A9.1 9.1 0 0 1 12 4c7 0 11 8 11 8a19 19 0 0 1-2.6 3.9M14.1 14.1a3 3 0 1 1-4.2-4.2"/><path d="M1 1l22 22"/> }
        @case ('menu') { <path d="M4 7h16M4 12h16M4 17h16"/> }
        @case ('star') { <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1L12 2Z"/> }
        @default { <circle cx="12" cy="12" r="9"/> }
      }
    </svg>
  `
})
export class UiIcon {
  @Input() name = 'compass';
  @Input() size = 18;
  @Input() stroke = 1.7;
}
