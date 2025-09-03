import { Component, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { QueryService } from '../query.service';

@Component({
  selector: 'selector',
  templateUrl: './selector.component.html',
  styleUrls: ['../app.component.css'],
})
export class SelectorComponent {
  @ViewChild(MatExpansionPanel) expansionPanel?: MatExpansionPanel;
  
  constructor(private queryService: QueryService) {}

  selectionText() {
    return this.queryService.selectionText();
  }
}
