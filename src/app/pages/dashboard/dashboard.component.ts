import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  records: any[] = [];
  paginatedRecords: any[] = [];
  selectAll: boolean = false;
  subject: string = '';
  messageTemplate: string = '';
  displayedColumns: string[] = ['select', 'name', 'email', 'organism'];
  pdfAttachment: File | null = null;
  // Props para el loader
  isSending: boolean = false;
  totalEmails: number = 0;
  sentCount: number = 0;
  progressValue: number = 0;

  // Tamaño de cada lote
  readonly BATCH_SIZE = 2;
  // Propiedades para paginación
  currentPage: number = 1;
  recordsPerPage: number = 20;
  totalPages: number = 0;
  totalRecords: number = 0;

  // Exponer Math para usar en el template
  Math = Math;

  constructor(private emailService: EmailService, private router: Router) { }
  handleFileUpload(records: any[]) {
    this.records = records;
    this.totalRecords = records.length;
    this.calculateTotalPages();
    this.updatePaginatedRecords();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.recordsPerPage);
  }

  updatePaginatedRecords() {
    const startIndex = (this.currentPage - 1) * this.recordsPerPage;
    const endIndex = startIndex + this.recordsPerPage;
    this.paginatedRecords = this.records.slice(startIndex, endIndex);
    this.selectAll = false;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedRecords();
    }
  }

  nextPage() {
    this.goToPage(this.currentPage + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage - 1);
  }

  changeRecordsPerPage(newSize: number) {
    this.recordsPerPage = newSize;
    this.currentPage = 1;
    this.calculateTotalPages();
    this.updatePaginatedRecords();
  }
  toggleSelectAll() {
    this.paginatedRecords.forEach(record => record.selected = this.selectAll);
  }

  onAttachmentChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.pdfAttachment = event.target.files[0];
    }
  }

  async sendEmails() {
    const allEmails = this.records
      .filter(r => r.selected)
      .map(r => r['CORREO ELECTRONICO']);

    const allNames = this.records
      .filter(r => r.selected)
      .map(r => r['APELLIDO Y NOMBRE']);

    if (!allEmails.length) {
      alert('Seleccione al menos un registro');
      return;
    }

    // Inicializar progreso
    this.isSending = true;
    this.totalEmails = allEmails.length;
    this.sentCount = 0;
    this.progressValue = 0;

    // Función para partir en lotes
    const batches: string[][] = [];
    for (let i = 0; i < allEmails.length; i += this.BATCH_SIZE) {
      batches.push(allEmails.slice(i, i + this.BATCH_SIZE));
    }

    // Preparar mailOptions comunes
    for (let batchStart = 0; batchStart < allEmails.length; batchStart += this.BATCH_SIZE) {
      const emailsBatch = allEmails.slice(batchStart, batchStart + this.BATCH_SIZE);
      const namesBatch = allNames.slice(batchStart, batchStart + this.BATCH_SIZE);

      // Preparo el FormData solo una vez por lote
      const formData = new FormData();
      formData.append('emails', JSON.stringify(emailsBatch));
      formData.append('names', JSON.stringify(namesBatch));
      formData.append('subject', this.subject);
      formData.append('messageTemplate', this.messageTemplate);
      if (this.pdfAttachment) {
        formData.append('attachment', this.pdfAttachment, this.pdfAttachment.name);
      }

      try {
        // Espero a que termine el envío del lote
        await firstValueFrom(this.emailService.sendEmail(formData));
      } catch (err) {
        console.error('Error enviando lote:', emailsBatch, err);
      }

      // Actualizo el progreso tras cada lote
      this.sentCount += emailsBatch.length;
      this.progressValue = (this.sentCount / this.totalEmails) * 100;
    }

    // Finalizo
    this.isSending = false;
    alert(`Proceso finalizado: ${this.sentCount}/${this.totalEmails} correos enviados.`);
  }

  logout(): void {
    // Remueve la variable de autenticación
    localStorage.removeItem('isLoggedIn');
    // Redirige al login
    this.router.navigate(['/']);
  }

  get isCompleted(): boolean {
    return this.progressValue >= 100;
  }
  
  refrescarPagina(): void {
    window.location.reload();
  }
  
}
