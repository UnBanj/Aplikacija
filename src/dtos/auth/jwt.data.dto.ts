export class JwtDataDto {
    role: "administrator" | "user"; //uloge
    id: number;
    identity: string;
    exp: number;
    ip: string;
    ua: string;
     // U slučaju da ovde dodamo još  neki podatak koji će trebati u token
  // automatski će svi prethodni tokeni koji su generisani biti pogrešni
    toPlanObject(){
        return {
            role: this.role,
            id: this.id,
            identity: this.identity,
            exp: this.exp,
            ip: this.ip,
            ua: this.ua
        }
    }
}