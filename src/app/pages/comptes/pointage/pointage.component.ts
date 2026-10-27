import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SheetsService } from '../../../core/sheets.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Operation } from '../../../core/models';

interface PointageItem extends Operation {
  pointed: boolean;
}

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [DecimalPipe, FormsModule],
  templateUrl: './pointage.component.html',
  styleUrl: './pointage.component.scss'
})
export class PointageComponent implements OnChanges {
  @Input() monthKey = '';
  @Input() operations: Operation[] = [];

  private sheets = inject(SheetsService);
  private toast = inject(ToastService);

  @Output() operationPointee = new EventEmitter<void>();

  items: PointageItem[] = [];
  expandedLigne: number | null = null;
  inputDate = '';
  inputLibelle = '';
  inputMontant = '';
  deduireDesCourses = false;
  filterText = '';

  get pendingItems(): PointageItem[] {
    return this.items.filter(i => !i.pointed);
  }

  get filteredPendingItems(): PointageItem[] {
    const q = this.filterText.trim().toLowerCase();
    if (!q) return this.pendingItems;
    return this.pendingItems.filter(i => i.libelle.toLowerCase().includes(q));
  }

  get pointedItems(): PointageItem[] {
    return this.items.filter(i => i.pointed);
  }

  ngOnChanges(): void {
    this.items = this.operations.map(op => ({ ...op, pointed: false }));
    this.expandedLigne = null;
    this.inputDate = '';
    this.inputLibelle = '';
    this.inputMontant = '';
    this.deduireDesCourses = false;
  }

  toggleExpand(item: PointageItem): void {
    if (item.pointed) return;
    if (this.expandedLigne === item.ligne) {
      this.expandedLigne = null;
      this.inputDate = '';
      this.inputLibelle = '';
      this.inputMontant = '';
      this.deduireDesCourses = false;
    } else {
      this.expandedLigne = item.ligne;
      this.inputDate = '';
      this.inputLibelle = item.libelle;
      this.inputMontant = item.montant?.toString() ?? '';
      this.deduireDesCourses = false;
    }
  }

  pointer(item: PointageItem): void {
    if (!this.inputDate || !this.inputLibelle) return;
    this.sheets.pointerOperation(this.monthKey, item.ligne, this.inputDate, this.inputLibelle, this.inputMontant, this.deduireDesCourses).subscribe({
      next: () => {
        const label = this.inputLibelle || item.libelle;
        item.pointed = true;
        this.expandedLigne = null;
        this.inputDate = '';
        this.inputLibelle = '';
        this.inputMontant = '';
        this.deduireDesCourses = false;
        this.toast.show(`${label} pointé`);
        this.operationPointee.emit();
      },
      error: () => this.toast.show('Erreur lors du pointage', 'error')
    });
  }
}
