import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ViewChild,
  AfterViewInit,
  ContentChild
} from '@angular/core';
import {
  FormControl
} from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { Floor } from '../floor.model';
import { Food, FoodTable } from '../food.model';
import { Subscription, Subject } from 'rxjs';

import { FloorService } from '../floor.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Fridge } from 'src/app/fridge/fridge.model';
import { FridgeService } from 'src/app/fridge/fridge.service';
import { MatDialog, MatSnackBar } from '@angular/material';
import { DialogDeleteComponent } from 'src/app/dialog-delete/dialog-delete.component';
import { FoodService } from '../food.service';
import { Router } from '@angular/router';

// import {MDCRipple} from '@material/ripple';

@Component({
  selector: 'app-fridginside-list',
  templateUrl: './fridgeInsideList.component.html',
  styleUrls: ['./fridgeInsideList.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class FridgeInsideListComponent implements OnInit, AfterViewInit, OnDestroy {
  isLoading = false;
  isLoadingBis = false;
  // isLoadingBis = false;
  userIsAuthenticated = false;

  data = {};

  fridge: Fridge;
  floors: Floor[] = [];
  foodList: Food[] = [];

  private floorsSub: Subscription;
  private foodSub: Subscription;
  private authStatusSub: Subscription;

  tabLoadTimes: Date[] = [];
  tabs = [];
  selectTabs = 0;
  floorIds = [];

  Error: string;
  ErrorFloors: string;

  // displayedColumns: string[] = ['id', 'name', 'progress', 'color'];
  // dataSource: MatTableDataSource<UserData>;
  displayedColumns: string[] = [
    'name',
    'type',
    'quantity',
    'expiration_date',
    'date_of_purchase',
    'star'
  ];
  dataSource: MatTableDataSource<Food>;

  selected = new FormControl(0);

  constructor(
    public floorService: FloorService,
    public fridgeService: FridgeService,
    public foodService: FoodService,
    private authService: AuthService,
    public dialog: MatDialog) {
    // Create 100 users
    // const users = Array.from({length: 100}, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();

    // const fabRipple = new MDCRipple(document.querySelector('.mdc-fab'));

  }

  private paginator: MatPaginator;
  private sort: MatSort;


  @ViewChild(MatSort, {static: false}) set content(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
    // this.dataSource.sort = ms;
  }

  @ViewChild(MatPaginator, {static: false}) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
      this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnInit() {
    this.isLoading = true;
    this.fridge = this.fridgeService.getCurrentFridge();
    this.floorService.getFloors();
    this.floorsSub = this.floorService.getFloorUpdateListener()
      .subscribe((floorData: {floors: Floor[]}) => {
        this.isLoading = false;
        this.floors = floorData.floors;
        this.tabs = this.getFloorsNames();
        this.floorIds = this.floorService.getListFloorIds();
        this.foodService.getFoodList(this.floorIds[0]);
      });
    this.isLoadingBis = true;
    this.foodSub = this.foodService.getFoodUpdateListener()
      .subscribe((foodData: {listOfFood: Food[]}) => {
        this.isLoadingBis = false;
        this.foodList = foodData.listOfFood;
        this.dataSource = new MatTableDataSource(this.foodList);
      });
  }

  getFloorsNames() {
    const tabs = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.floors.length; i++) {
        tabs.push(this.floors[i].name);
    }
    return tabs;
  }

  updateDataSource($event) {
    this.isLoadingBis = true;
    this.selectTabs = $event;
    this.foodService.getFoodList(this.floors[$event].id);
    this.foodSub = this.foodService.getFoodUpdateListener()
      .subscribe((foodData: {listOfFood: Food[]}) => {
        this.isLoadingBis = false;
        this.foodList = foodData.listOfFood;
        this.dataSource = new MatTableDataSource(this.foodList);
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.floorService.getErrorListener().subscribe(
      next => {
        this.ErrorFloors = next;
        this.isLoading = false;
      },
      error => {
        this.ErrorFloors = error;
        this.isLoading = false;
      }
    );
    this.foodService.getErrorListener().subscribe(
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

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(name: string, id: number, typeElem: string): void {
    if (typeElem === 'food') {
      // tslint:disable-next-line:object-literal-shorthand
      this.data = {name: name, typeElem: typeElem, id: id, floorIds: this.floorIds};
    } else {
      // tslint:disable-next-line:object-literal-shorthand
      this.data = {name: name, typeElem: typeElem, id: id};
    }
    const dialogRef = this.dialog.open(DialogDeleteComponent, {
      width: '450px',
      // tslint:disable-next-line:object-literal-shorthand
      data: this.data
    });

    if (typeElem === 'food') {
      dialogRef.afterClosed().subscribe((food: Food) => {
        this.foodList.forEach( (item, index) => {
          if (item.id === food.id) {
            this.foodList.splice(index, 1);
            this.dataSource = new MatTableDataSource(this.foodList);
          }
        });
      });
    } else {
      dialogRef.afterClosed().subscribe((floor: Floor) => {
        this.floors.forEach( (item, index) => {
          if (item.id === floor.id) {
            this.floors.splice(index, 1);
          }
        });
      });
    }
  }

  ngOnDestroy() {
    this.floorsSub.unsubscribe();
  }
}
