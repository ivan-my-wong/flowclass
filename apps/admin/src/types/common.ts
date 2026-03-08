/**
 * Represents a base model with timestamps and an ID.
 * This type can be used as a foundation for other model types in the application.
 *
 * @description
 * @property {number} id - The unique identifier for the model instance.
 * @property {Date} createdAt - The date and time when the instance was created.
 * @property {Date} updatedAt - The date and time when the instance was last updated.
 */
export type BaseModelWithTimestamps = {
  id: number
  createdAt: Date
  updatedAt: Date
}

export type DataTestId = {
  dataTestId?: string
}
