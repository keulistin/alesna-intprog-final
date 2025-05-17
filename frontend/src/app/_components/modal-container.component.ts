import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService } from '@app/_services/modal.service';

@Component({
    selector: 'app-modal-container',
    template: `
        <div class="modal-backdrop" *ngIf="showModal" (click)="onBackdropClick()"></div>
        <div class="modal" tabindex="-1" [ngClass]="{ 'show': showModal }" *ngIf="showModal">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{title}}</h5>
                        <button type="button" class="btn-close" (click)="close()"></button>
                    </div>
                    <div class="modal-body">
                        <ng-content></ng-content>
                        <div *ngIf="content">{{content}}</div>
                    </div>
                    <div class="modal-footer" *ngIf="showFooter">
                        <button type="button" class="btn btn-secondary" (click)="close()">Close</button>
                        <button type="button" class="btn btn-primary" (click)="confirm()" *ngIf="showConfirm">{{confirmText}}</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1040;
        }
        .modal {
            display: block;
            z-index: 1050;
        }
    `]
})
export class ModalContainerComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    showModal = false;
    title = 'Modal';
    content: string = null;
    showFooter = true;
    showConfirm = true;
    confirmText = 'Confirm';
    currentId: string = null;
    closeOnBackdrop = true;
    onConfirm: () => void = () => {};

    constructor(private modalService: ModalService) {
        this.subscription = new Subscription();
    }

    ngOnInit() {
        this.subscription = this.modalService.modal$.subscribe(modal => {
            if (modal.action === 'open') {
                this.showModal = true;
                this.currentId = modal.id;
                
                if (modal.data) {
                    this.title = modal.data.title || this.title;
                    this.content = modal.data.content || this.content;
                    this.showFooter = modal.data.showFooter !== undefined ? modal.data.showFooter : this.showFooter;
                    this.showConfirm = modal.data.showConfirm !== undefined ? modal.data.showConfirm : this.showConfirm;
                    this.confirmText = modal.data.confirmText || this.confirmText;
                    this.closeOnBackdrop = modal.data.closeOnBackdrop !== undefined ? modal.data.closeOnBackdrop : this.closeOnBackdrop;
                    this.onConfirm = modal.data.onConfirm || this.onConfirm;
                }
                
                document.body.classList.add('modal-open');
            } else if (modal.action === 'close' && modal.id === this.currentId) {
                this.showModal = false;
                this.currentId = null;
                document.body.classList.remove('modal-open');
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    close() {
        if (this.currentId) {
            this.modalService.close(this.currentId);
        }
    }

    confirm() {
        if (this.onConfirm) {
            this.onConfirm();
        }
        this.close();
    }

    onBackdropClick() {
        if (this.closeOnBackdrop) {
            this.close();
        }
    }
} 