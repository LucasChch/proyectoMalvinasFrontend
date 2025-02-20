interface ExcelRecord {
  [key: string]: any; // Permite propiedades dinámicas
  selected: boolean;   // Agrega la propiedad 'selected' de forma explícita
}

import { Component, EventEmitter, Output } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-file-upload',
  template: `
    <mat-card>
      <mat-card-title>Importar Archivo Excel</mat-card-title>
      <mat-card-content>
        <input type="file" (change)="onFileChange($event)" accept=".xlsx, .xls" />
      </mat-card-content>  
    </mat-card>  
  `,
  styles: [`
    mat-card {
      margin-bottom: 20px;
    }  
  `]    
})
export class FileUploadComponent {
  @Output() fileUploaded = new EventEmitter<any[]>();

  onFileChange(evt: any) {
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
      const records: ExcelRecord[] = data.slice(1).map((row: any[]) => {
        let record: ExcelRecord = { selected: false }; // Inicializamos 'selected' en false
        headers.forEach((header, index) => {
          record[header] = row[index] ?? ''; // Asignamos valores evitando 'undefined'
        });  
        return record;
      });  
      


      this.fileUploaded.emit(records);
    };  
    reader.readAsBinaryString(target.files[0]);
  }  
}  

