import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListWorkflowComponent } from './list.component';
import { AddWorkflowComponent } from './add.component';
import { ViewWorkflowComponent } from './view.component';
import { ConfirmModalComponent } from './confirm-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            { path: '', component: ListWorkflowComponent },
            { path: 'add', component: AddWorkflowComponent },
            { path: 'view/:id', component: ViewWorkflowComponent }
        ])
    ],
    declarations: [
        ListWorkflowComponent,
        AddWorkflowComponent,
        ViewWorkflowComponent,
        ConfirmModalComponent
    ]
})
export class WorkflowsModule { } 