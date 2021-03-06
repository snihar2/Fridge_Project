import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FridgeService } from '../fridge.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Fridge } from '../fridge.model';
import { Router } from '@angular/router';
import { DialogDeleteComponent } from 'src/app/dialog-delete/dialog-delete.component';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-fridge-list',
  templateUrl: './fridge-list.component.html',
  styleUrls: ['./fridge-list.component.css']
})
export class FridgeListComponent implements OnInit, OnDestroy, AfterViewInit {
  fridges: Fridge[] = [];
  isLoading = false;
  private fridgesSub: Subscription;

  Error: string;
  data = {};

  constructor(
    public fridgeService: FridgeService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog) {}

  ngOnInit() {
    this.isLoading = true;
    this.fridgeService.getFridges();
    this.fridgesSub = this.fridgeService.getFridgeUpdateListener()
      // fridgeData same format as getposts from post.service
      .subscribe((fridgeData: {fridges: Fridge[]}) => {
        this.isLoading = false;
        this.fridges = fridgeData.fridges;
      });
  }

  ngAfterViewInit(): void {
    this.fridgeService.getErrorListener().subscribe(
        next => {
          this.Error = next;
          this.isLoading = false;
        },
        error => {
          this.Error = error;
          this.isLoading = false;
        }
    );
  }

  setFridge(fridgeId: number) {
    this.isLoading = true;
    this.fridgeService.setCurrentFridge(fridgeId);
    this.router.navigate(['/fridge/floors']);
  }

  openDialog(name: string, id: number, typeElem: string): void {
    // tslint:disable-next-line:object-literal-shorthand
    this.data = {name: name, typeElem: typeElem, id: id};
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '450px',
      // tslint:disable-next-line:object-literal-shorthand
      data: this.data
    });

    dialogRef.afterClosed().subscribe((fridge: Fridge) => {
      if (fridge) {
        this.fridges.forEach( (item, index) => {
          if (item.id === fridge.id) {
            this.fridges.splice(index, 1);
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.fridgesSub.unsubscribe();
  }


}
