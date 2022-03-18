export class JwtDataDto {
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
            ext: this.exp,
            ip: this.ip,
            ua: this.ua
        }
    }
}