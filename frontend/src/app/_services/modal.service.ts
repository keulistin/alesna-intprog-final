import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalData {
    action?: 'open' | 'close';
    id?: string;
    title?: string;
    message?: string;
    content?: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    showFooter?: boolean;
    showConfirm?: boolean;
    closeOnBackdrop?: boolean;
    onConfirm?: () => void;
    data?: {
        title?: string;
        content?: string;
        showFooter?: boolean;
        showConfirm?: boolean;
        confirmText?: string;
        closeOnBackdrop?: boolean;
        onConfirm?: () => void;
    };
}

@Injectable({ providedIn: 'root' })
export class ModalService {
    private modalSubject = new Subject<ModalData>();
    private modalResponse = new Subject<boolean>();

    modal$ = this.modalSubject.asObservable();
    response$ = this.modalResponse.asObservable();

    show(data: ModalData) {
        this.modalSubject.next({ ...data, action: 'open' });
        return this.response$;
    }

    close(id: string) {
        this.modalSubject.next({ id, action: 'close' });
    }

    confirm() {
        this.modalResponse.next(true);
    }

    cancel() {
        this.modalResponse.next(false);
    }
} 