import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

import { ResponseUserDto } from './response-user.dto'

export class StudentLoginDto {
  @ApiProperty({
    example: 'flowclasstest3@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({
    example: '!Flowclasstest123456',
  })
  @IsNotEmpty()
  @MaxLength(40)
  password: string
}

export class StudentLoginSocialDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImY4NzZiNzIxNDAwYmZhZmEyOWQ0MTFmZTYwODE2YmRhZWMyM2IzODIiLCJ0eXAiOiJKV1QifQ.eyJuYW1lIjoiQ2h1IFbEg24gVuG7pSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BR05teXhaQVRsVDJpc1NPMlA2MVRBbVh2bjJid3JDQk1rVVN0VVhnNEJacD1zOTYtYyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9mbG93Y2xhc3MtODIyNTgiLCJhdWQiOiJmbG93Y2xhc3MtODIyNTgiLCJhdXRoX3RpbWUiOjE2NzgwOTIyODcsInVzZXJfaWQiOiJuQ1RFRVRxS05SVjFySjNTcXp1anpQSXBrTFgyIiwic3ViIjoibkNURUVUcUtOUlYxckozU3F6dWp6UElwa0xYMiIsImlhdCI6MTY3ODA5MjI4NywiZXhwIjoxNjc4MDk1ODg3LCJlbWFpbCI6InZ1Y3ZAc2N1dGkuYXNpYSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7Imdvb2dsZS5jb20iOlsiMTAzNDcwNzg4MDIwMjg1NDQxOTYxIl0sImVtYWlsIjpbInZ1Y3ZAc2N1dGkuYXNpYSJdfSwic2lnbl9pbl9wcm92aWRlciI6Imdvb2dsZS5jb20ifX0.hWWtVVqK1GxdT0d6Z8Cp13dhD3UjiHU_ltjgh4GLc9y_9jXXs4MyFy0R5kDUCIR6l8ji-izeDzmUt6z4pu6j-K9wzCtd1uSA_aQuPcyXRnJOuI371TIngvAnRf2Tyoo5nzoJHqEOX6zKITFHfGKqmTTLa-8_2sbRcAKZgMhyFEwbzu1woUDOypg-TYqsd_QMYUWEFhiqsQnSe2KSYep9XOuEI6NOnnfXbAkfXLoSf0pl3vGfVDlscRW4dL7NN0p_oWuHSfIyuQNb1ZvRRBanPZbOb2rYKgv2nfvdVDbcRaNZpNT9jE3orAsCLI5MG64oVy2FsoCTZpnFoEeU-NJsJQ',
  })
  @IsNotEmpty()
  idToken: string
}

@Exclude()
export class LoginResponse {
  user: ResponseUserDto

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjdW9uZ2xoMUBnbWFpbC5jb20iLCJsYXN0TmFtZSI6IkN1b25nIiwiZmlyc3ROYW1lIjoiTGUiLCJpYXQiOjE2NzcxMjg4MDQsImV4cCI6MTY3NzIxNTIwNH0.OvOOAAPmniPJ0RSeeLM3gAUQMrKhmzw5tOTWdUDhIxE',
  })
  @Expose()
  accessToken: string
}
