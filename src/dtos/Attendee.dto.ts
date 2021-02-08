import { AttendeeRole } from "../entities/attendee.entity";

export class AttendeeDto {
  name: string;
  email: string;
  role: AttendeeRole;
}