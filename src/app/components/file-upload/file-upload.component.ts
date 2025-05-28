interface ExcelRecord {
  [key: string]: any; // Permite propiedades dinámicas
  selected: boolean;   // Agrega la propiedad 'selected' de forma explícita
}

import { Component, EventEmitter, Output } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload',
  template: `
    <mat-card class="file-upload-card">
      <mat-card-title>
        <span class="file-upload-title">
          <mat-icon color="primary">upload_file</mat-icon>
          <span>Importar Archivo Excel</span>
        </span>
      </mat-card-title>
      <mat-card-content>
        <input #fileInput type="file" (change)="onFileChange($event, fileInput)" accept=".xlsx, .xls" hidden />
        <button mat-raised-button color="primary" (click)="fileInput.click()">
          <mat-icon>upload</mat-icon>
          Seleccionar archivo Excel
        </button>
        <span class="file-upload-filename" *ngIf="fileInput.value">{{ fileInput.value.split('\\').pop() }}</span>
      </mat-card-content>  
    </mat-card>  
  `,
  styles: [`
    .file-upload-card {
      margin-bottom: 20px;
      padding-bottom: 10px;
    }
    .file-upload-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.2rem;
      font-weight: 600;
      color: #002868;
    }
    button[mat-raised-button] {
      margin-top: 10px;
      margin-bottom: 5px;
      font-weight: 500;
      text-transform: none;
    }
    .file-upload-filename {
      margin-left: 1rem;
      color: #555;
      font-size: 0.95rem;
    }
  `]
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<any[]>();

  onFileChange(evt: any, fileInput: HTMLInputElement) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) {
      alert('Solo se permite cargar un archivo a la vez');
      return;
    }
  
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      // Leer el contenido del archivo
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
      // Convertir la hoja a JSON (con la primera fila como cabecera)
      const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
      const headers: string[] = data[0] as string[];
      const records: ExcelRecord[] = data.slice(1)
        .filter(row => row.some(cell => cell && cell.toString().trim() !== '')) // Filtrar filas vacías
        .map((row: any[]) => {
          let record: ExcelRecord = { selected: false };
          headers.forEach((header, index) => {
            record[header] = row[index] ?? '';
          });
          return record;
        });
  
      this.fileUploaded.emit(records);
      fileInput.value = ''; // <-- Resetea el input para permitir reimportar el mismo archivo
    };
  
    reader.readAsBinaryString(target.files[0]);
  }
  
}

