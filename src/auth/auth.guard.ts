import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorator/is-public-validator.decorator";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
        private reflector: Reflector
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (isPublic)
            return true

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request)

        if (!token) {
            throw new UnauthorizedException("Formato de token inválido")
        }

        try {
            const payload = this.authService.verifyToken(token)

            request['user'] = payload
        } catch {
            throw new UnauthorizedException("Token Inválido")
        }
        return true
    }

    extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}