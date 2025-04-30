import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
  imagePreview: string | null = null;
  
  
  communities: any[] = [
    { id: 1, name: 'Health & Wellness' },
    { id: 2, name: 'Medical Professionals' },
    { id: 3, name: 'Patient Support' },
    { id: 4, name: 'Fitness Group' }
  ];
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
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
      capacity: [{value: null, disabled: true}],
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
    this.imagePreview = null;
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
    
    this.imagePreview = imageUrl || null;
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
        Validators.max(100)
      ]);
    } else {
      // For public events: Disable capacity and set to null
      capacityControl?.setValue(null);
      capacityControl?.disable();
      capacityControl?.clearValidators();
    }
    capacityControl?.updateValueAndValidity();
  }
  
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
  removeImage(): void {
    this.imagePreview = null;
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
    
    const finalImageUrl = this.imagePreview || (formData.imageUrl?.trim() || null);
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