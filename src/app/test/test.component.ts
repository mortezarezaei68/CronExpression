import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
formGroup:FormGroup;
  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.formGroup=this.fb.group({
      testText:['']
    });
  }

}
