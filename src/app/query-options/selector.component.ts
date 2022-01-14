import { Component } from '@angular/core';
import { QueryService } from '../query.service';

@Component({
  selector: 'selector',
  templateUrl: './selector.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectorComponent {
  constructor(private queryService: QueryService) {}

  selectionText() {
    return this.queryService.selectionText();
  }
}
