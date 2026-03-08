# Appointment Entity Documentation

## Overview

The Appointment entity is a sub-entity that is designed to be assigned to a Class entity through a one-to-one relationship. This architecture allows for flexible appointment management while maintaining a clear relationship with the class structure.

## Relationship Structure

```
Class Entity (1) <---> (1) Appointment Entity
```

The relationship is established through the `appointment_id` field in the Class entity, which references the primary key of the Appointment entity.

## Key Concepts

### Appointment as a Sub-Entity

The Appointment entity is designed to be a sub-entity of a Class. This means:

1. An Appointment cannot exist independently without being associated with a Class
2. A Class can have at most one Appointment linked to it
3. The Appointment entity contains specific appointment-related properties that are not part of the Class entity

### Class-Appointment Relationship

The Class entity has an `appointmentId` field that establishes the relationship with the Appointment entity:

```typescript
@Column({ name: 'appointment_id', nullable: true })
appointmentId: number;

@OneToOne(() => ClassEntity, (classEntity) => classEntity.appointment, {
  createForeignKeyConstraints: false,
})
@JoinColumn({ name: 'appointment_id' })
appointment: ClassEntity;
```

## Creating Appointments

When creating a new appointment, the process typically involves:

1. Creating or identifying an existing Class entity
2. Creating a new Appointment entity
3. Linking the Appointment to the Class by updating the Class's `appointmentId` field

Example flow:

```typescript
// Create a new appointment
const newAppointment = this.appointmentRepository.create({
  institutionId: classEntity.institutionId,
  classId: classEntity.id,
  // ... other appointment properties
});

// Save the appointment
const savedAppointment = await this.appointmentRepository.save(newAppointment);

// Update the class with the appointment ID
await this.classRepository.update(classEntity.id, { appointmentId: savedAppointment.id });
```

## Appointment Service

The AppointmentService provides methods for managing appointments:

- `createAppointmentTemplate`: Creates an appointment template linked to a class
- `getByClass`: Retrieves an appointment by class ID
- `update`: Updates an existing appointment
- `delete`: Deletes an appointment
- `assignAvailability`: Links an availability to an appointment
- `removeAvailability`: Removes an availability link from an appointment

## Integration with Availability

Appointments can be linked to Availability entities to manage scheduling:

1. An Appointment can have one Availability linked to it
2. The Availability provides scheduling information for the Appointment
3. The AppointmentService provides methods for managing this relationship

## Best Practices

1. Always create a Class first before creating an Appointment
2. Use the `createAppointmentTemplate` method to create appointments linked to classes
3. Check if a class already has an appointment before creating a new one
4. When deleting a Class, ensure the associated Appointment is also deleted
5. Use the provided service methods for managing the relationship between Appointments and Availabilities

## Example Usage

```typescript
// Create a class for an appointment
const classEntity = await this.classService.createClass({
  // Class properties
  type: ClassTypeEnum.APPOINTMENT,
  // ... other properties
});

// Create an appointment template for the class
const appointment = await this.appointmentService.createAppointmentTemplate(
  classEntity,
  appointmentDTO,
  user
);
```

This architecture ensures a clean separation of concerns while maintaining a clear relationship between classes and appointments.
