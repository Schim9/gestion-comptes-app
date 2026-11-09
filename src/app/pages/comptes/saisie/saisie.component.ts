import { Component, Output, EventEmitter, OnInit, inject, input, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SheetsService } from '../../../core/sheets.service';
import { ToastService } from '../../../shared/toast/toast.service';
import { OperationRequest } from '../../../core/models';

const DRAFT_KEY = 'saisie_form_draft';

@Component({
  selector: 'app-saisie',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './saisie.component.html',
  styleUrl: './saisie.component.scss'
})
export class SaisieComponent implements OnInit {
  monthKey = input('');

  @Output() operationSaisie = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private sheets = inject(SheetsService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loading = signal(false);

  form = this.fb.group({
    libelle: ['', Validators.required],
    compte: ['CCM', Validators.required],
    sens: ['debit', Validators.required],
    montant: [null as number | null, [Validators.required, Validators.min(0.01)]],
    dejaDebite: [false],
    date: [null as string | null],
    deduireDesCourses: [false]
  });

  ngOnInit(): void {
    const draft = sessionStorage.getItem(DRAFT_KEY);
    if (draft) {
      try { this.form.patchValue(JSON.parse(draft)); }
      catch { sessionStorage.removeItem(DRAFT_KEY); }
    }
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => sessionStorage.setItem(DRAFT_KEY, JSON.stringify(v)));
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
      date: v.dejaDebite ? String(v.date) : null,
      deduireDesCourses: v.deduireDesCourses ?? false
    };

    this.loading.set(true);
    this.sheets.addOperation(this.monthKey(), request).subscribe({
      next: res => {
        this.loading.set(false);
        const label = res.created
          ? `Mois de ${this.monthKey()} créé dans le Google Sheet`
          : 'Opération enregistrée';
        this.toast.show(label);
        sessionStorage.removeItem(DRAFT_KEY);
        this.form.reset({ compte: 'CCM', sens: 'debit', dejaDebite: false, deduireDesCourses: false });
        this.operationSaisie.emit();
      },
      error: () => {
        this.loading.set(false);
        this.toast.show('Erreur lors de l\'enregistrement', 'error');
      }
    });
  }
}
