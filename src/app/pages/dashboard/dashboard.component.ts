import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  records: any[] = [];
  selectAll: boolean = false;
  subject: string = '';
  message: string = '';
  displayedColumns: string[] = ['select', 'name', 'email', 'organism'];
  pdfAttachment: File | null = null;

  constructor(private emailService: EmailService, private router: Router) { }

  handleFileUpload(records: any[]) {
    this.records = records;
  }

  toggleSelectAll() {
    this.records.forEach(record => record.selected = this.selectAll);
  }

  onAttachmentChange(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.pdfAttachment = event.target.files[0];
    }
  }

  sendEmails() {
    const selectedEmails = this.records
      .filter(record => record.selected)
      .map(record => record['CORREO ELECTRONICO']);

    if (!selectedEmails.length) {
      alert('Seleccione al menos un registro para enviar correo');
      return;
    }
    // Crear FormData para enviar archivos junto con el resto de los datos
    const formData = new FormData();
    formData.append('emails', JSON.stringify(selectedEmails));
    formData.append('subject', this.subject);
    formData.append('message', this.message);
    if (this.pdfAttachment) {
      formData.append('attachment', this.pdfAttachment, this.pdfAttachment.name);
    } 

    this.emailService.sendEmail(formData)
      .subscribe(
        response => {
          alert('Correos enviados exitosamente');
        },
        error => {
          console.error(error);
          alert('Error al enviar correos');
        }
      );
  }

  logout(): void {
    // Remueve la variable de autenticación
    localStorage.removeItem('isLoggedIn');
    // Redirige al login
    this.router.navigate(['/']);
  }
}
