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
  
  // Event types definition
  eventTypes = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];
  
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
    
    // Check if visibility or edit mode changed
    if (changes['isVisible'] && changes['isVisible'].currentValue === true) {
      if (this.editMode && this.eventData) {
        // In edit mode, populate form with event data
        this.populateForm();
      } else {
        // In create mode, reset the form
        this.resetForm();
      }
    }
  }
  
  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      community: ['', [Validators.required]], 
      type: ['public', [Validators.required]],
      capacity: [50, [Validators.required, Validators.min(1), Validators.max(1000)]],
      imageUrl: [''], 
      location: ['', [Validators.required]],
      description: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
    
    // Monitor type changes for capacity validation
    this.eventForm.get('type')?.valueChanges.subscribe(type => {
      const capacityControl = this.eventForm.get('capacity');
      if (type === 'private') {
        capacityControl?.setValidators([
          Validators.required, 
          Validators.min(1), 
          Validators.max(100) 
        ]);
      } else {
        capacityControl?.setValidators([
          Validators.required, 
          Validators.min(1), 
          Validators.max(1000) 
        ]);
      }
      capacityControl?.updateValueAndValidity();
    });
  }
  
  resetForm(): void {
    this.eventForm.reset({
      title: '',
      community: '',
      type: 'public',
      capacity: 50,
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
    
    const startDate = new Date(this.eventData.startDate);
    const endDate = new Date(this.eventData.endDate);
    
    this.eventForm.patchValue({
      title: this.eventData.title,
      community: this.eventData.community || '',
      type: this.eventData.type || 'public',
      capacity: this.eventData.capacity || 50,
      description: this.eventData.description,
      location: this.eventData.location || '',
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    });
    
    if (this.eventData.coverImage) {
      this.imagePreview = this.eventData.coverImage;
    }
  }
  
  setEventType(type: 'public' | 'private'): void {
    this.eventForm.patchValue({ type });
    
    // capacity validation based on type
    const capacityControl = this.eventForm.get('capacity');
    if (type === 'private') {
      capacityControl?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(100)
      ]);
    } else {
      capacityControl?.setValidators([
        Validators.required, 
        Validators.min(1), 
        Validators.max(1000)
      ]);
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
    this.resetForm();  // Reset form when closing
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
    
    // Prepare form data
    const formData = this.eventForm.value;
    
    // Create the event object to submit
    const eventData = {
      id: this.editMode ? this.eventData?.id : null, // Only include ID when editing
      title: formData.title,
      community: formData.community,
      type: formData.type,
      capacity: formData.capacity,
      description: formData.description,
      location: formData.location,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      coverImage: this.imagePreview || formData.imageUrl || null
    };
    
    // Submit event data 
    this.formSubmit.emit(eventData);
    this.isSubmitting = false;
  }
  
}