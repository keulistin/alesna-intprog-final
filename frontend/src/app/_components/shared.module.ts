import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ModalComponent } from './modal.component';
import { ModalContainerComponent } from './modal-container.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule
    ],
    declarations: [
        ModalComponent,
        ModalContainerComponent
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ModalComponent,
        ModalContainerComponent
    ]
})
export class SharedModule { }