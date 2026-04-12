import {
  Component,
  Input,
  forwardRef,
  signal,
  computed,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.html',
  styleUrl: './searchable-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelectComponent),
      multi: true,
    },
  ],
})
export class SearchableSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select…';

  private elRef = inject(ElementRef);

  isOpen      = signal(false);
  searchQuery = signal('');
  selectedValue = signal<number | null>(null);
  isDisabled  = signal(false);

  // Fixed-position coordinates for the panel
  panelTop   = signal('0px');
  panelLeft  = signal('0px');
  panelWidth = signal('0px');

  filteredOptions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return !q ? this.options : this.options.filter(o => o.label.toLowerCase().includes(q));
  });

  selectedLabel = computed(() => {
    const val = this.selectedValue();
    if (val === null) return null;
    return this.options.find(o => o.value === val)?.label ?? null;
  });

  private onChange: (v: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.selectedValue.set(value ?? null);
  }

  registerOnChange(fn: (v: number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    const opening = !this.isOpen();
    if (opening) {
      this.searchQuery.set('');
      // Measure trigger position so the fixed panel aligns with it
      const trigger = (this.elRef.nativeElement as HTMLElement).querySelector('.ss-trigger');
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        this.panelTop.set(`${rect.bottom + 4}px`);
        this.panelLeft.set(`${rect.left}px`);
        this.panelWidth.set(`${rect.width}px`);
      }
    }
    this.isOpen.set(opening);
    this.onTouched();
  }

  select(value: number): void {
    this.selectedValue.set(value);
    this.onChange(value);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  // Close on scroll so the panel doesn't drift away from the trigger
  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isOpen()) this.isOpen.set(false);
  }
}