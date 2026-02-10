import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guest } from '../entities/guest.entity';
import { SourceType } from '../../common/enums';

@Injectable()
export class GuestsService {
  constructor(
    @InjectRepository(Guest)
    private readonly repo: Repository<Guest>,
  ) {}

  async findOrCreateByEmail(
    email: string,
    name: string | null,
  ): Promise<Guest> {
    const normalizedEmail = email.toLowerCase().trim();
    let guest = await this.repo.findOne({
      where: { email: normalizedEmail },
    });

    if (guest) {
      // Update name if incoming name is longer/more complete
      if (name && (!guest.name || name.length > guest.name.length)) {
        guest.name = name;
        await this.repo.save(guest);
      }
      return guest;
    }

    const newGuest = this.repo.create({
      name,
      email: normalizedEmail,
      source: SourceType.Email,
    });
    return this.repo.save(newGuest);
  }
}
