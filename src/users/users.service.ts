import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { UserSignUpDto } from './dto/user-signup.dto';
import { hash, compare } from 'bcrypt';
import { UserSignInDto } from './dto/user-signin.dto';
import { sign } from 'jsonwebtoken';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { TokenEntity } from 'src/tokens/entities/token.entity';
import { TokensService } from 'src/tokens/tokens.service';
import { Roles } from 'src/utility/common/user-roles.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(TokenEntity)
    private tokensRepository: Repository<TokenEntity>,
    private mailService: MailerService,
    private jwtService: JwtService,
    private tokensService: TokensService,
  ) {}

  async signup(userSignUpDto: UserSignUpDto): Promise<UserEntity> {
    const userExists = await this.findUserByEmail(userSignUpDto.email);
    if (userExists) throw new BadRequestException('Email already exists.');
    userSignUpDto.password = await hash(userSignUpDto.password, 10);
    let user = this.usersRepository.create(userSignUpDto);
    user = await this.usersRepository.save(user);
    delete user.password;

    if (user.role === Roles.SELLER) {
      //send email to xác thực email
      const randomToken = await this.tokensService.randomToken();
      await this.sendAuthenEmail(
        userSignUpDto.email,
        randomToken.token,
        user.id,
      );
    }

    return user;
  }

  async signin(userSignInDto: UserSignInDto): Promise<UserEntity> {
    const userExists = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email=:email', { email: userSignInDto.email })
      .getOne();
    if (!userExists) throw new BadRequestException('Email does not exist.');
    const matchPassword = await compare(
      userSignInDto.password,
      userExists.password,
    );
    if (!matchPassword) throw new BadRequestException('Wrong login password.');
    delete userExists.password;
    return userExists;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('user not found.');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException('user not found.');
      Object.assign(user, updateUserDto);
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async accessToken(user: UserEntity): Promise<string> {
    return sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRE_TIME },
    );
  }

  /***************** Fotgot Password  */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({
      where: {
        email: forgotPasswordDto.email,
      },
    });

    if (!user) throw new NotFoundException('User not found.');

    const token = await this.accessToken(user);

    return await this.sendResetMail(forgotPasswordDto.email, token);
  }

  async sendResetMail(toEmail: string, token: string) {
    try {
      const mail = await this.mailService.sendMail({
        to: toEmail,
        from: 'support@example.com',
        subject: 'Reset Password',
        html:
          '<h1>Reset Password</h1> <h2>Welcome</h2><p>To reset your password, please click on this link</p><a href=http://localhost:3000/reset-password/' +
          token +
          '>Click this </a>',
      });

      if (!mail) {
        throw new BadRequestException('An error occurred while sending mail');
      }

      return mail;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async sendAuthenEmail(toEmail: string, token: string, sellerId: number) {
    try {
      const mail = await this.mailService.sendMail({
        to: toEmail,
        from: 'support@example.com',
        subject: 'Verify Email & Setup Store',
        html:
          '<h1>Verify Email & Setup Store</h1> <h2>Welcome</h2><p>To verify email and setup store, please click on this link</p><a href=http://localhost:3000/auth/uploads/' +
          token +
          '/' +
          sellerId +
          '>Click this </a>',
      });

      if (!mail) {
        throw new BadRequestException('An error occurred while sending mail');
      }

      return mail;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(token: string, resetPassword: ResetPasswordDto) {
    const decodedToken = await this.jwtService.verifyAsync(token);
    console.log(decodedToken);

    const userId = decodedToken.userId;

    const foundUser = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await hash(resetPassword.password, 10);

    foundUser.password = hashedPassword;

    const updatedUser = await this.usersRepository.save(foundUser);
    delete updatedUser.password;
    return updatedUser;
  }

  async changePassword(
    currentUser: UserEntity,
    changePasswordDto: ChangePasswordDto,
  ) {
    const foundUser = await this.usersRepository.findOne({
      where: {
        id: currentUser.id,
      },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const matchPassword = await compare(
      changePasswordDto.oldPassword,
      foundUser.password,
    );

    if (!matchPassword) throw new BadRequestException('Wrong old password.');

    currentUser.password = await hash(changePasswordDto.newPassword, 10);

    const updatedUser = await this.usersRepository.save(currentUser);
    delete updatedUser.password;
    return updatedUser;
  }
}
