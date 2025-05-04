import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommunityService, CommunityNameDto } from '../../../services/community/community.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() editMode = false;
  @Input() eventData: any = null;

  @Output() formClose = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<any>();

  eventForm!: FormGroup;
  isSubmitting = false;

  communities: CommunityNameDto[] = [];
  isLoadingCommunities = false;
  communityError = '';

  constructor(private fb: FormBuilder, private communityService: CommunityService) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCommunities();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.eventForm) {
      this.initForm();
    }

    if ((changes['eventData']?.currentValue ||
      (changes['isVisible'] && changes['isVisible'].currentValue === true))) {
      if (this.editMode && this.eventData) {
        this.populateForm();
      } else if (changes['isVisible']?.currentValue === true) {
        this.resetForm();
      }
    }
  }
  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      community: ['', [Validators.required]],
      type: ['public', [Validators.required]],
      capacity: [{ value: null, disabled: true }],
      imageUrl: [''],
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });

    // Monitor type changes
    this.eventForm.get('type')?.valueChanges.subscribe(type => {
      this.setEventType(type);
    });
  }
  loadCommunities(): void {
    this.isLoadingCommunities = true;
    this.communityError = '';

    this.communityService.getCommunityNames().subscribe({
      next: (communities) => {
        this.communities = communities;
        this.isLoadingCommunities = false;
      },
      error: (err) => {
        console.error('Error loading communities:', err);
        this.communityError = 'Unable to load communities. Please try again.';
        this.isLoadingCommunities = false;
      }
    });
  }
  resetForm(): void {
    this.eventForm.reset({
      title: '',
      community: '',
      type: 'public',
      imageUrl: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
    });
  }

  populateForm(): void {
    if (!this.eventData) return;

    const isPublic = Number(this.eventData.eventType) === 0 ||
      String(this.eventData.eventType).toLowerCase() === 'public';

    const startDate = new Date(this.eventData.startDate);
    const endDate = new Date(this.eventData.endDate);
    const imageUrl = this.eventData.imageUrl || '';

    this.eventForm.patchValue({
      title: this.eventData.title,
      type: isPublic ? 'public' : 'private',
      community: this.eventData.communityId || '',
      description: this.eventData.description,
      location: this.eventData.location || '',
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
      imageUrl: imageUrl || ''
    });
    const capacityControl = this.eventForm.get('capacity');
    if (isPublic) {
      capacityControl?.disable();
    } else {
      capacityControl?.enable();
      capacityControl?.setValue(this.eventData.capacity ?? 50);
    }
  }

  setEventType(type: 'public' | 'private'): void {
    this.eventForm.patchValue({ type }, { emitEvent: false });

    // capacity validation based on type
    const capacityControl = this.eventForm.get('capacity');
    if (type === 'private') {
      // For private events: Enable capacity with validation
      capacityControl?.enable();
      capacityControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(1000)
      ]);
    } else {
      // For public events: Disable capacity and set to null
      capacityControl?.setValue(null);
      capacityControl?.disable();
      capacityControl?.clearValidators();
    }
    capacityControl?.updateValueAndValidity();
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  closeForm(): void {
    this.resetForm();
    this.formClose.emit();
  }
  saveEvent(): void {
    if (this.eventForm.invalid) {
      Object.keys(this.eventForm.controls).forEach(key => {
        this.eventForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formData = this.eventForm.getRawValue();

    const finalImageUrl = formData.imageUrl?.trim() || null;
    // Convert string values to numeric enum values for API
    const eventData = {
      publicEventId: this.editMode ? this.eventData?.publicEventId : null,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      // Only include capacity for private events
      ...(formData.type === 'private' ? { capacity: formData.capacity } : { capacity: 0 }),
      communityId: formData.community,
      eventType: formData.type === 'public' ? 0 : 1,
      status: this.calculateStatus(new Date(formData.startDate), new Date(formData.endDate)),
      imageUrl: finalImageUrl,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate)
    };

    this.formSubmit.emit(eventData);
    this.isSubmitting = false;
  }
  calculateStatus(startDate: Date, endDate: Date): number {
    const now = new Date();
    if (startDate > now) {
      return 0; // Upcoming
    } else if (endDate < now) {
      return 2; // Finished
    } else {
      return 1; // Active
    }
  }
}