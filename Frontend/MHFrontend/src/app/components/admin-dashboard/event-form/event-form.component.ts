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
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (!this.eventForm) {
      this.initForm();
    }
    
    if (this.eventData && this.editMode) {
      this.populateForm();
    }
  }
  
  initForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      type: ['public', [Validators.required]], // Default to public
      capacity: [50, [Validators.required, Validators.min(1), Validators.max(1000)]],
      description: ['', [Validators.required]],
      isOnline: [false],
      location: [''],
      meetingUrl: [''],
      startDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      endTime: ['', [Validators.required]]
    });
    
    this.eventForm.get('isOnline')?.valueChanges.subscribe(isOnline => {
      this.updateValidators();
    });
    
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
  
  populateForm(): void {
    if (!this.eventData) return;
    
    const startDate = new Date(this.eventData.startDate);
    const endDate = new Date(this.eventData.endDate);
    
    this.eventForm.patchValue({
      title: this.eventData.title,
      type: this.eventData.type || 'public',
      capacity: this.eventData.capacity || 50,
      description: this.eventData.description,
      isOnline: this.eventData.isOnline,
      location: this.eventData.location,
      meetingUrl: this.eventData.meetingUrl,
      startDate: this.formatDate(startDate),
      startTime: this.formatTime(startDate),
      endDate: this.formatDate(endDate),
      endTime: this.formatTime(endDate)
    });
    
    if (this.eventData.image) {
      this.imagePreview = this.eventData.image;
    }
    
    this.updateValidators();
  }
  
  setOnlineMode(isOnline: boolean): void {
    this.eventForm.patchValue({ isOnline });
    this.updateValidators();
  }
  
  updateValidators(): void {
    const isOnline = this.eventForm.get('isOnline')?.value;
    
    if (isOnline) {
      this.eventForm.get('location')?.clearValidators();
      this.eventForm.get('meetingUrl')?.setValidators([
        Validators.required, 
        Validators.pattern('https?://.+')
      ]);
    } else {
      this.eventForm.get('meetingUrl')?.clearValidators();
      this.eventForm.get('location')?.setValidators([Validators.required]);
    }
    
    this.eventForm.get('location')?.updateValueAndValidity();
    this.eventForm.get('meetingUrl')?.updateValueAndValidity();
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
  
  formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }
  
  closeForm(): void {
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
    
    // Combine date and time into Date objects
    const startDateTime = this.combineDateTime(formData.startDate, formData.startTime);
    const endDateTime = this.combineDateTime(formData.endDate, formData.endTime);
    
    // Create the event object to submit
    const eventData = {
      id: this.eventData?.id,
      title: formData.title,
      type: formData.type,
      capacity: formData.capacity,
      description: formData.description,
      isOnline: formData.isOnline,
      location: formData.isOnline ? null : formData.location,
      meetingUrl: formData.isOnline ? formData.meetingUrl : null,
      startDate: startDateTime,
      endDate: endDateTime,
      coverImage: this.imagePreview
    };
    
    // Submit event data 
    this.formSubmit.emit(eventData);
    this.isSubmitting = false;
  }
  
  // combine date and time strings into a Date object
  combineDateTime(dateStr: string, timeStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  }
}