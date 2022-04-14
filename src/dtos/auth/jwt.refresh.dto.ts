export class JwtRefreshDataDto {
    role: "administrator" | "user"; //uloge
    id: number;
    identity: string;
    exp: number;
    ip: string;
    ua: string;

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