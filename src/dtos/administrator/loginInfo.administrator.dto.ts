export class LoginInfoAdministratorDto {
    administatorId: number;
    username: string;
    token: string;

    constructor(id: number, un: string,jwt: string ){
        this.administatorId = id;
        this.username = un;
        this.token = jwt;
    }
}