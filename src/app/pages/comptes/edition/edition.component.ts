import { Component, Input, Output, EventEmitter, OnChanges, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SheetsService } from '../../../core/sheets.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { Operation, UpdateOperationRequest } from '../../../core/models';

@Component({
  selector: 'app-edition',
  standalone: true,
  imports: [DecimalPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './edition.component.html',
  styleUrl: './edition.component.scss'
})
export class EditionComponent implements OnChanges {
  @Input() monthKey = '';
  @Input() operationsReelles: Operation[] = [];
  @Input() operationsPrevisionnelles: Operation[] = [];

  @Output() operationModifiee = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sheets = inject(SheetsService);
  private toast = inject(ToastService);

  selectedOperation: Operation | null = null;
  loading = false;
  filterText = '';
  confirmAction: 'depointer' | 'supprimer' | null = null;

  form = this.fb.group({
    libelle: ['', Validators.required],
    sens: ['debit', Validators.required],
    montant: [null as number | null, [Validators.required, Validators.min(0.01)]],
    compte: ['CCM', Validators.required],
    date: [null as number | null]
  });

  get aVenirOps(): Operation[] {
    return this.operationsPrevisionnelles.filter(op => op.type === 'a_venir');
  }

  get filteredReelles(): Operation[] {
    const q = this.filterText.trim().toLowerCase();
    const ops = q ? this.operationsReelles.filter(op => op.libelle.toLowerCase().includes(q)) : this.operationsReelles;
    return [...ops].sort((a, b) => b.ligne - a.ligne);
  }

  get filteredAVenir(): Operation[] {
    const q = this.filterText.trim().toLowerCase();
    const ops = q ? this.aVenirOps.filter(op => op.libelle.toLowerCase().includes(q)) : this.aVenirOps;
    return [...ops].sort((a, b) => b.ligne - a.ligne);
  }

  ngOnChanges(): void {
    this.selectedOperation = null;
    this.filterText = '';
    this.form.reset({ sens: 'debit', compte: 'CCM' });
  }

  selectOperation(op: Operation): void {
    if (this.selectedOperation?.ligne === op.ligne) {
      this.selectedOperation = null;
      this.form.reset({ sens: 'debit', compte: 'CCM' });
      return;
    }
    this.selectedOperation = op;
    this.confirmAction = null;
    const montantAbs = Math.abs(op.montant);
    const sens = op.montant >= 0 ? 'credit' : 'debit';
    this.form.patchValue({
      libelle: op.libelle,
      sens,
      montant: montantAbs,
      compte: op.compte,
      date: op.date ? Number(op.date) : null
    });
  }

  isReel(op: Operation): boolean {
    return !op.type;
  }

  submit(): void {
    if (this.form.invalid || !this.selectedOperation) return;
    const v = this.form.value;
    const montantSigne = v.sens === 'debit' ? -(v.montant!) : v.montant!;

    const req: UpdateOperationRequest = {
      libelle: v.libelle!,
      date: this.isReel(this.selectedOperation) && v.date != null ? String(v.date) : null,
      montant: montantSigne,
      compte: v.compte as 'CCM' | 'Boursorama'
    };

    this.loading = true;
    this.sheets.updateOperation(this.monthKey, this.selectedOperation.ligne, req).subscribe({
      next: () => {
        this.loading = false;
        this.toast.show(`"${req.libelle}" modifié`);
        this.selectedOperation = null;
        this.form.reset({ sens: 'debit', compte: 'CCM' });
        this.operationModifiee.emit();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Erreur lors de la modification', 'error');
      }
    });
  }

  cancel(): void {
    this.selectedOperation = null;
    this.confirmAction = null;
    this.form.reset({ sens: 'debit', compte: 'CCM' });
  }

  requestConfirm(action: 'depointer' | 'supprimer'): void {
    this.confirmAction = action;
  }

  cancelConfirm(): void {
    this.confirmAction = null;
  }

  confirmAndExecute(): void {
    if (!this.selectedOperation || !this.confirmAction) return;
    const op = this.selectedOperation;
    const action = this.confirmAction;

    this.loading = true;
    const call$ = action === 'supprimer'
      ? this.sheets.deleteOperation(this.monthKey, op.ligne)
      : this.sheets.depointeOperation(this.monthKey, op.ligne);

    call$.subscribe({
      next: () => {
        this.loading = false;
        const msg = action === 'supprimer'
          ? `"${op.libelle}" supprimé`
          : `"${op.libelle}" dépointé — remis en "à venir"`;
        this.toast.show(msg);
        this.selectedOperation = null;
        this.confirmAction = null;
        this.form.reset({ sens: 'debit', compte: 'CCM' });
        this.operationModifiee.emit();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Erreur lors de l\'opération', 'error');
        this.confirmAction = null;
      }
    });
  }
}
