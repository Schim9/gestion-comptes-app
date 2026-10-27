import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SheetsService } from '../../../core/sheets.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { OperationRequest } from '../../../core/models';

const DRAFT_KEY = 'saisie_form_draft';

@Component({
  selector: 'app-saisie',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './saisie.component.html',
  styleUrl: './saisie.component.scss'
})
export class SaisieComponent implements OnInit {
  @Input() monthKey = '';

  @Output() operationSaisie = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sheets = inject(SheetsService);
  private toast = inject(ToastService);

  loading = false;

  form = this.fb.group({
    libelle: ['', Validators.required],
    compte: ['CCM', Validators.required],
    sens: ['debit', Validators.required],
    montant: [null as number | null, [Validators.required, Validators.min(0.01)]],
    dejaDebite: [false],
    date: [null as string | null]
  });

  ngOnInit(): void {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (draft) {
      this.form.patchValue(JSON.parse(draft));
    }
    this.form.valueChanges.subscribe(v => sessionStorage.setItem(DRAFT_KEY, JSON.stringify(v)));
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.value;

    const montantSigne = v.sens === 'debit' ? -(v.montant!) : v.montant!;

    const request: OperationRequest = {
      libelle: v.libelle!,
      compte: v.compte as 'CCM' | 'Boursorama',
      montant: montantSigne,
      dejaDebite: v.dejaDebite ?? false,
      date: v.dejaDebite ? String(v.date) : null
    };

    this.loading = true;
    this.sheets.addOperation(this.monthKey, request).subscribe({
      next: res => {
        this.loading = false;
        const label = res.created
          ? `Mois de ${this.monthKey} créé dans le Google Sheet`
          : 'Opération enregistrée';
        this.toast.show(label);
        sessionStorage.removeItem(DRAFT_KEY);
        this.form.reset({ compte: 'CCM', sens: 'debit', dejaDebite: false });
        this.operationSaisie.emit();
      },
      error: () => {
        this.loading = false;
        this.toast.show('Erreur lors de l\'enregistrement', 'error');
      }
    });
  }
}
