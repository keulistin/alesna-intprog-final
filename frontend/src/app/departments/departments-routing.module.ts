import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list.component';
import { AddEditDepartmentComponent } from './add-edit.component';

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: 'add', component: AddEditDepartmentComponent },
    { path: 'edit/:id', component: AddEditDepartmentComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DepartmentsRoutingModule { }