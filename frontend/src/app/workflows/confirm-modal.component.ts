import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';
declare var bootstrap: any;

@Component({
    selector: 'app-confirm-modal',
    template: `
        <div class="modal fade" #modal tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-light border-0">
                        <h5 class="modal-title">Confirm Status Change</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body text-center py-4">
                        <div class="mb-4">
                            <i class="fas fa-question-circle text-primary" style="font-size: 3.5rem;"></i>
                        </div>
                        <p class="h5 mb-0">{{ message }}</p>
                    </div>
                    <div class="modal-footer bg-light border-0">
                        <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary px-4" (click)="confirm()">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .modal-content {
            border-radius: 1rem;
        }
        .modal-header, .modal-footer {
            padding: 1.5rem;
        }
        .modal-body {
            padding: 2rem;
        }
        .btn {
            border-radius: 0.5rem;
            font-weight: 500;
        }
    `]
})
export class ConfirmModalComponent implements AfterViewInit {
    @ViewChild('modal') modalElement!: ElementRef;
    @Input() message: string = '';
    @Output() confirmed = new EventEmitter<void>();
    
    private modalInstance: any;

    ngAfterViewInit() {
        this.modalInstance = new bootstrap.Modal(this.modalElement.nativeElement);
    }

    show() {
        this.modalInstance.show();
    }

    hide() {
        this.modalInstance.hide();
    }

    confirm() {
        this.confirmed.emit();
        this.hide();
    }
} 