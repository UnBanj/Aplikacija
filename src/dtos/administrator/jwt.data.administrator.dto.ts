export class JwtDataAdministratorDto {
    administratorId: number;
    username: string;
    exp: number;
    ip: string;
    ua: string;

    toPlanObject(){
        return {
            administratorId: this.administratorId,
            username: this.username,
            ext: this.exp,
            ip: this.ip,
            ua: this.ua
        }
    }
}