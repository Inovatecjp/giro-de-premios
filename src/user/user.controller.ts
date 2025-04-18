import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ResponseUserDTO } from './dto/response-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { PatchUpdateUser } from './dto/patch-update-user.dto';
import { PutUpdateUser } from './dto/put-update-user.dto';

import { plainToInstance } from 'class-transformer';
import { AuthService } from '../auth/auth.service';
import { IsPublic } from '../decorator/is-public-validator.decorator';

@Controller('users')
export default class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) { }

  @Get()
  async findAll(@Query('skip') skip = 1, @Query('take') take = 10): Promise<any> {
    try {

      const pagination = {
        skip,
        take
      }

      const users = await this.userService.findAll(pagination);
      return { data: users }
    } catch (error) {
      throw error
    }
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<any> {
    try {
      const user = await this.userService.findById(id);

      return { data: user }
    } catch (error) {
      throw error
    }
  }

  @IsPublic()
  @Post()
  async create(@Body() data: CreateUserDTO): Promise<any> {
    try {
      const user = await this.userService.create(data);

      const credentialsPayload = {
        ...data.credentials,
        user_id: user.id
      }

      if (data.credentials.provider === "email") {
        await this.authService.registerLocal(credentialsPayload);
      } else {
        await this.authService.registerSocial(credentialsPayload);
      }

      const userResponse = plainToInstance(ResponseUserDTO, {
        ...user,
        comissao: user.comissao.toString()
      });

      return { data: { userResponse } }
    } catch (error) {
      throw error
    }
  }


  @Patch(':id')
  async updatePatch(@Param('id') id: string, @Body() data: PatchUpdateUser): Promise<any> {
    try {

      const user = await this.userService.update(id, data);

      const userResponse = plainToInstance(ResponseUserDTO, {
        ...user,
        comissao: user.comissao.toString()
      });

      return { data: { userResponse } }
    } catch (error) {
      throw error
    }
  }

  @Put(':id')
  async updatePut(@Param('id') id: string, @Body() data: PutUpdateUser): Promise<any> {
    try {
      const user = await this.userService.update(id, data);

      const userResponse = plainToInstance(ResponseUserDTO, {
        ...user,
        comissao: user.comissao.toString(),
      });

      return { data: { userResponse } }
    } catch (error) {
      throw error
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<any> {
    try {
      if (await this.userService.delete(id))
        return { data: "Usuario deletado com sucesso" };
    } catch (error) {
      throw error
    }
  }
}
