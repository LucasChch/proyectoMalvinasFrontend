import { Component } from '@angular/core';
import { EmailService } from '../../services/email.service';

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
  displayedColumns: string[] = ['select', 'email']; // Agrega más columnas según tu necesidad

  constructor(private emailService: EmailService) {}

  handleFileUpload(records: any[]) {
    this.records = records;
  }

  toggleSelectAll() {
    this.records.forEach(record => record.selected = this.selectAll);
  }

  sendEmails() {
    const selectedEmails = this.records
      .filter(record => record.selected)
      .map(record => record['CORREO ELECTRONICO']);
    
    if (!selectedEmails.length) {
      alert('Seleccione al menos un registro para enviar correo');
      return;
    }
    
    this.emailService.sendEmail(selectedEmails, this.subject, this.message)
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
}
