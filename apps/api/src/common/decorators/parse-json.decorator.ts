import { BadRequestException, PipeTransform } from '@nestjs/common'

export class ParseJson implements PipeTransform<string> {
  transform(value: string): Record<string, string> {
    if (!value) {
      return {}
    }
    try {
      return JSON.parse(value) as Record<string, string>
    } catch (error) {
      throw new BadRequestException('Invalid JSON')
    }
  }
}
