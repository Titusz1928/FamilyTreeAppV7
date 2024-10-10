import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditModeService } from '../services/edit-mode.service';
import { LoginDialogComponent } from './dialogs/login-dialog/login-dialog.component';
import { InfoDialogComponent } from './dialogs/info-dialog/info-dialog.component';

@Component({
  selector: 'ftapp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  canEdit: boolean = false;

  constructor(private dialog: MatDialog, private editModeService: EditModeService) { }

  ngOnInit(): void { }

  saveData(): void {
    this.canEdit = false;
    this.editModeService.setCanEdit(false); // Update the service to notify other components
  }

  openLoginDialog(): void {
    const dialogRef = this.dialog.open(LoginDialogComponent);

    dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
      // Update the component's canEdit property
      this.canEdit = result === true;
      this.editModeService.setCanEdit(this.canEdit); // Update the service with the new value
      console.log('The dialog was closed');
      console.log('canEdit:', this.canEdit);
    });
  }

  openInfoDialog(): void {
    const dialogRef = this.dialog.open(InfoDialogComponent);

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
    });
  }
}
 {

}

