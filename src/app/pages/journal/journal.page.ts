import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.page.html',
  styleUrls: ['./journal.page.scss'],
})
export class JournalPage implements OnInit {

  dataJournal: any[] = [];
  constructor() { }

  ngOnInit() {
  }

  segmentChanged( event: any ) {
    
  }

}
