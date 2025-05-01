import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

interface CommunityData {
  id?: number;
  name: string;
  image?: string;
  description: string;
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
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder) {}

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
      description: ['', [Validators.required]]
    });
    
    this.imagePreview = null;
    this.selectedFile = null;
  }

  populateForm() {
    if (!this.communityData) return;
    
    this.communityForm.patchValue({
      name: this.communityData.name,
      description: this.communityData.description
    });
    
    if (this.communityData.image) {
      this.imagePreview = this.communityData.image;
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.imagePreview = null;
    this.selectedFile = null;
  }

  saveCommunity() {
    if (this.communityForm.invalid) return;
    
    this.isSubmitting = true;
    
    const formValues = this.communityForm.value;
    
    // Create the community data object
    const communityData: CommunityData = {
      id: this.communityData?.id,
      name: formValues.name,
      description: formValues.description,
      image: this.imagePreview || undefined
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