import { CommonModule } from '@angular/common';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, RouterOutlet, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
})
export class App implements OnDestroy {
  transitioning = false;
  private transitionTimeout?: any;
  private sub: Subscription;
  private navStartTime = 0;
  private readonly minDuration = 2000; // minimum overlay (ms)
  private readonly exitBuffer = 500;   // smooth fade-out cushion

  constructor(router: Router, private cdr: ChangeDetectorRef) {
    this.sub = router.events
      .pipe(
        filter(
          (ev) =>
            ev instanceof NavigationStart ||
            ev instanceof NavigationEnd ||
            ev instanceof NavigationCancel ||
            ev instanceof NavigationError
        )
      )
      .subscribe((ev) => {
        if (ev instanceof NavigationStart) {
          this.startTransition();
        } else {
          this.endTransition();
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
  }

  private startTransition() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    // Restart animation even if it was already showing by toggling it off/on.
    this.transitioning = false;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.transitioning = true;
      this.navStartTime = performance.now();
      this.cdr.detectChanges();
    }, 0);
  }

  private endTransition() {
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    const elapsed = performance.now() - this.navStartTime;
    const remaining = Math.max(0, this.minDuration - elapsed);
    this.transitionTimeout = setTimeout(() => {
      this.transitioning = false;
      this.cdr.detectChanges();
    }, remaining + this.exitBuffer);
  }
}
