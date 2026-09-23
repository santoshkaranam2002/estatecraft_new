import { Component } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { UiIcon } from '../ui-icon/ui-icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [UiIcon],
  template: `
    <div class="toast" [class.show]="toast.state().visible" [class.error]="toast.state().type === 'error'">
      <ui-icon [name]="toast.state().type === 'error' ? 'x' : 'check'" [size]="15"></ui-icon>
      {{ toast.state().message }}
    </div>
  `
})
export class Toast {
  constructor(public toast: ToastService) {}
}
