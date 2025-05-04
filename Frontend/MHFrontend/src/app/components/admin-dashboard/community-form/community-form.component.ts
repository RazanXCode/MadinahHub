import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface CommunityData {
  publicCommunityId?: string
  name: string;
  description: string;
  imageUrl?: string;
  memberCount?: number;
  createdAt?: Date;
}

@Component({
  selector: 'app-community-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './community-form.component.html',
  styleUrl: './community-form.component.css'
})
export class CommunityFormComponent implements OnInit, OnChanges {
  @Input() isVisible = false;
  @Input() editMode = false;
  @Input() communityData: CommunityData | null = null;
  @Output() formClose = new EventEmitter<void>();
  @Output() formSubmit = new EventEmitter<CommunityData>();

  communityForm!: FormGroup;
  isSubmitting = false;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible'] && this.isVisible) {
      this.initializeForm();

      if (this.editMode && this.communityData) {
        this.populateForm();
      }
    }
  }

  initializeForm() {
    this.communityForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      imageUrl: ['']
    });

    this.imagePreview = null;
  }

  populateForm() {
    if (!this.communityData) return;

    this.communityForm.patchValue({
      name: this.communityData.name,
      description: this.communityData.description
    });

    if (this.communityData.imageUrl) {
      this.imagePreview = this.communityData.imageUrl;
    }
  }
  previewImageFromUrl(event: any): void {
    const url = event.target.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      this.imagePreview = url;
    } else {
      this.imagePreview = null;
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.communityForm.get('imageUrl')?.setValue('');
  }

  saveCommunity() {
    if (this.communityForm.invalid) return;

    this.isSubmitting = true;

    const formValues = this.communityForm.value;

    // Create the community data object
    const communityData: CommunityData = {
      name: formValues.name,
      description: formValues.description,
      imageUrl: this.imagePreview || undefined
    };

    this.formSubmit.emit(communityData);
    this.isSubmitting = false;
    this.closeForm();
  }

  closeForm() {
    this.communityForm.reset();
    this.formClose.emit();
  }
}