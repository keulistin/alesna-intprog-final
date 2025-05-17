import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LayoutComponent } from './layout.component';
import { ListComponent } from './list.component';
import { AddEditEmployeeComponent } from './add-edit.component';
import { TransferComponent } from './transfer.component';
import { TransferModalComponent } from './transfer-modal.component';

const routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: ListComponent },
            { path: 'add', component: AddEditEmployeeComponent },
            { path: 'edit/:id', component: AddEditEmployeeComponent }
        ]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        LayoutComponent,
        ListComponent,
        AddEditEmployeeComponent,
        TransferComponent,
        TransferModalComponent
    ]
})
export class EmployeesModule { } 