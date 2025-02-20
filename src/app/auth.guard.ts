import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    // Por simplicidad, vamos a usar localStorage para determinar si el usuario está autenticado.
    // En el login, al autenticar, se guardará un flag, por ejemplo "isLoggedIn" = "true".
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (isLoggedIn === 'true') {
      return true;
    } else {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/']);
      return false;
    }
  }
}
