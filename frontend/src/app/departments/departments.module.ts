import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import if your components use forms
import { RouterModule } from '@angular/router';
import { DepartmentsRoutingModule } from './departments-routing.module'; // Import the routing module
import { LayoutComponent } from './layout.component';
// Import components used in this module
// Option 1: If using a DepartmentsLayoutComponent
// import { DepartmentsLayoutComponent } from './departments-layout.component';
import { ListComponent } from './list.component';
import { AddEditDepartmentComponent } from './add-edit.component';

@NgModule({
    declarations: [
        // DepartmentsLayoutComponent, // Declare if using Option 1 for routing
        ListComponent,
        AddEditDepartmentComponent,
        LayoutComponent
    ],
    imports: [
        CommonModule,
        FormsModule,         // Or ReactiveFormsModule, or both
        ReactiveFormsModule,
        DepartmentsRoutingModule,
        RouterModule
    ]
})
export class DepartmentsModule { } // This is the class name your admin-routing.module.ts expects