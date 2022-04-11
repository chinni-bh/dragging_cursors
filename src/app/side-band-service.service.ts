import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SideBandServiceService {
  markerClickSubject = new Subject();
  sidebandDragSubject = new Subject<number>();
  constructor() {}
}