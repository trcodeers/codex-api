export interface JwtPayload {
  sub: string;
  email: string;
  role: 'Aspirant' | 'Admin';
}
