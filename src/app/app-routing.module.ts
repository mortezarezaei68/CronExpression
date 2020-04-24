import { TestComponent } from './test/test.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CronTestComponent } from './cron-test/cron-test.component';


const routes: Routes = [
  {path: 'testcron', component: CronTestComponent},
  {path: 'testmaterial', component: TestComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
