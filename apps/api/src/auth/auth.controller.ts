import { Controller, Post, Body, Res, Get, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { SessionGuard } from '../common/guards/session.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response, @Req() req: Request) {
    const { email, password } = body;
    const { sessionId } = await this.authService.login(email, password, req);

    res.cookie('void_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 * 1000, // 24 hours
    });

    return res.send({ message: 'Login successful' });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies?.['void_session'];
    if (sessionId) {
      await this.authService.logout(sessionId, req);
    }

    res.clearCookie('void_session');
    return res.send({ message: 'Logout successful' });
  }

  @Get('me')
  @UseGuards(SessionGuard)
  async me(@Req() req: Request) {
    return req['user'];
  }
}
