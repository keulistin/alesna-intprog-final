import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutComponent } from './layout.component';
import { RequestListComponent } from './list.component';
import { RequestAddEditComponent } from './add-edit.component';
import { ViewComponent } from './view.component';
import { MyRequestsComponent } from './my-requests.component';

const routes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            { path: '', component: RequestListComponent },
            { path: 'my-requests', component: MyRequestsComponent },
            { path: 'add', component: RequestAddEditComponent },
            { path: 'edit/:id', component: RequestAddEditComponent },
            { path: 'view/:id', component: ViewComponent }
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
        RequestListComponent,
        RequestAddEditComponent,
        ViewComponent,
        MyRequestsComponent
    ]
})
export class RequestsModule { } 