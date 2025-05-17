import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '@app/_services/modal.service';

@Component({
    selector: 'app-modal',
    template: `
        <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
            <div class="modal-dialog" role="dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ data?.title }}</h5>
                        <button type="button" class="btn-close" (click)="cancel()"></button>
                    </div>
                    <div class="modal-body">
                        <p>{{ data?.message }}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" (click)="cancel()" *ngIf="data?.showCancel">
                            {{ data?.cancelText || 'Cancel' }}
                        </button>
                        <button type="button" class="btn btn-primary" (click)="confirm()">
                            {{ data?.confirmText || 'Confirm' }}
                        </button>
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
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1050;
        }
        .modal-dialog {
            background: white;
            border-radius: 4px;
            max-width: 500px;
            width: 100%;
            margin: 1.75rem auto;
        }
        .modal-content {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            pointer-events: auto;
            background-color: #fff;
            border: 1px solid rgba(0, 0, 0, 0.2);
            border-radius: 0.3rem;
            outline: 0;
        }
        .modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            border-top-left-radius: 0.3rem;
            border-top-right-radius: 0.3rem;
        }
        .modal-body {
            position: relative;
            flex: 1 1 auto;
            padding: 1rem;
        }
        .modal-footer {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-end;
            padding: 0.75rem;
            border-top: 1px solid #dee2e6;
            border-bottom-right-radius: 0.3rem;
            border-bottom-left-radius: 0.3rem;
        }
    `]
})
export class ModalComponent implements OnInit, OnDestroy {
    isOpen = false;
    data: ModalData | null = null;
    private subscription: Subscription;

    constructor(private modalService: ModalService) {
        this.subscription = this.modalService.modal$.subscribe(data => {
            this.data = data;
            this.isOpen = true;
        });
    }

    ngOnInit() {}

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    confirm() {
        this.modalService.confirm();
        this.isOpen = false;
    }

    cancel() {
        this.modalService.cancel();
        this.isOpen = false;
    }

    onBackdropClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
            this.cancel();
        }
    }
}