import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-pills',
  standalone: true,
  templateUrl: './pills.component.html',
  styleUrls: ['./pills.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PillsComponent {
  readonly text = input.required<string>();
}
