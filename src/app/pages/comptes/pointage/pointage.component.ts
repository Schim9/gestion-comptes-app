import { Component, Output, EventEmitter, inject, input, signal, computed, effect } from '@angular/core';
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
export class PointageComponent {
  monthKey   = input('');
  operations = input<Operation[]>([]);

  private sheets = inject(SheetsService);
  private toast = inject(ToastService);

  @Output() operationPointee = new EventEmitter<void>();

  items = signal<PointageItem[]>([]);
  expandedLigne: number | null = null;
  inputDate = '';
  inputLibelle = '';
  inputMontant = '';
  filterText = signal('');
  confirmTransfert = false;

  pendingItems = computed(() => this.items().filter(i => !i.pointed));
  filteredPendingItems = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    if (!q) return this.pendingItems();
    return this.pendingItems().filter(i => i.libelle.toLowerCase().includes(q));
  });
  pointedItems = computed(() => this.items().filter(i => i.pointed));

  constructor() {
    effect(() => {
      this.items.set(this.operations().map(op => ({ ...op, pointed: false })));
      this.expandedLigne = null;
      this.inputDate = '';
      this.inputLibelle = '';
      this.inputMontant = '';
      this.confirmTransfert = false;
    }, { allowSignalWrites: true });
  }

  toggleExpand(item: PointageItem): void {
    if (item.pointed) return;
    if (this.expandedLigne === item.ligne) {
      this.expandedLigne = null;
      this.inputDate = '';
      this.inputLibelle = '';
      this.inputMontant = '';
      this.confirmTransfert = false;
    } else {
      this.expandedLigne = item.ligne;
      this.inputDate = '';
      this.inputLibelle = item.libelle;
      this.inputMontant = item.montant?.toString() ?? '';
      this.confirmTransfert = false;
    }
  }

  transferer(item: PointageItem): void {
    this.sheets.transfererOperation(this.monthKey(), item.ligne).subscribe({
      next: res => {
        this.items.update(items => items.map(i => i.ligne === item.ligne ? { ...i, pointed: true } : i));
        this.expandedLigne = null;
        this.confirmTransfert = false;
        this.toast.show(`"${item.libelle}" transféré vers ${res.targetMonth}`);
        this.operationPointee.emit();
      },
      error: () => this.toast.show('Erreur lors du transfert', 'error')
    });
  }

  pointer(item: PointageItem): void {
    if (!this.inputDate || !this.inputLibelle) return;
    this.sheets.pointerOperation(this.monthKey(), item.ligne, this.inputDate, this.inputLibelle, this.inputMontant).subscribe({
      next: () => {
        const label = this.inputLibelle || item.libelle;
        this.items.update(items => items.map(i => i.ligne === item.ligne ? { ...i, pointed: true } : i));
        this.expandedLigne = null;
        this.inputDate = '';
        this.inputLibelle = '';
        this.inputMontant = '';
        this.toast.show(`${label} pointé`);
        this.operationPointee.emit();
      },
      error: () => this.toast.show('Erreur lors du pointage', 'error')
    });
  }
}
