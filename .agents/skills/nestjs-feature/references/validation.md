# Validation in Nest 12

Docs: https://docs.nestjs.com/application/validation.md

Two pipes, both in `@nestjs/common`:

- `StandardSchemaValidationPipe` (Nest 12.1+) validates parameters that declare a `schema`: Zod, Valibot, ArkType or any [Standard Schema](https://standardschema.dev/) library. No classes, no reflection metadata; the parameter's type is inferred from the schema.
- `ValidationPipe` validates parameters typed with a class decorated with class-validator rules (`npm i class-validator class-transformer`).

Each pipe ignores the other's parameters, so both can be bound at once while an app moves from one to the other.

## Schemas (Zod shown)

```typescript
// main.ts
import { StandardSchemaValidationPipe } from '@nestjs/common';
app.useGlobalPipes(new StandardSchemaValidationPipe());
```

```typescript
// notes.schemas.ts
import { z } from 'zod';

export const createNoteSchema = z.object({ title: z.string().trim().min(1).max(200) });
export type CreateNote = z.infer<typeof createNoteSchema>;

// Any subset; a field that's present must be valid, and null is rejected.
export const updateNoteSchema = z
  .object({ title: z.string().trim().min(1).max(200), archived: z.boolean() })
  .partial();
export type UpdateNote = z.infer<typeof updateNoteSchema>;

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});
```

```typescript
// notes.controller.ts
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { z } from 'zod';

const id = z.coerce.number().int().positive();

@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Post()
  create(@Body({ schema: createNoteSchema }) body: CreateNote) {
    return this.notes.create(body);
  }

  @Get()
  list(@Query({ schema: listQuerySchema }) query: z.infer<typeof listQuerySchema>) {
    return this.notes.list(query);
  }

  @Patch(':id')
  update(@Param('id', { schema: id }) noteId: number, @Body({ schema: updateNoteSchema }) body: UpdateNote) {
    return this.notes.update(noteId, body);
  }
}
```

- `schema` works on `@Body()`, `@Query()`, `@Param()`, on a single property (`@Body('email', { schema: z.email() })`), and on custom decorators from `createParamDecorator()`.
- Path and query values are strings: use `z.coerce.number()` for numbers.
- By default the handler receives the schema's output (coerced, defaulted, transformed). `new StandardSchemaValidationPipe({ transform: false })` passes the input through instead.
- Failures are 400 with `message` as an array of strings prefixed by the property path, e.g. `"title: Too small: expected string to have >=1 characters"`.
- Unknown keys: `z.object()` strips them, `z.strictObject()` rejects them (`Unrecognized key: "age"`).
- Booleans in query strings: `z.stringbool()` (`"true"`, `"1"`, `"yes"` → true; `"false"`, `"0"`, `"no"` → false; anything else is a 400). `z.coerce.boolean()` is JavaScript's `Boolean()`: any non-empty string, `"false"` included, is `true` (checked, Zod 4.6).
- An empty PATCH body (`{}`) passes `.partial()`. If the contract requires at least one field, add `.refine((v) => Object.keys(v).length > 0, 'Nothing to update')`.
- The same schemas describe the API in `@nestjs/swagger` (Zod 4.2+ converts itself): see the `nestjs-production` skill.

## class-validator DTOs

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // add forbidNonWhitelisted: true to reject unknown keys
```

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsString, Length, ValidateIf } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @Length(1, 200)
  title: string;
}

export class UpdateNoteDto {
  // Not @IsOptional(): that skips every rule for null as well as undefined,
  // so {"title": null} would reach the database.
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Length(1, 200)
  title?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  archived?: boolean;
}

// Or derive it: PartialType() applies @IsOptional() to every field (null gets through)
// unless you pass skipNullProperties: false, which applies the ValidateIf above instead.
export class UpdateNoteDto2 extends PartialType(CreateNoteDto, { skipNullProperties: false }) {}
```

Checked on Nest 12.5 with class-validator 0.15: with `@IsOptional() @IsString()`, `{"title": null}` passes (200); with `@ValidateIf((_, v) => v !== undefined) @IsString()`, it's a 400, and `{}` still passes.

- Nested objects and arrays: `@ValidateNested()` and `@Type(() => Address)` (from class-transformer) together; `@ValidateNested({ each: true })` for arrays. Checked: with both, `{"address":{"city":5}}` is a 400 (`address.city must be a string`); without `@Type()`, it passes as 201.
- `whitelist: true` drops unknown properties without a word, so a misspelt field (`tilte`) is silently ignored and the update does nothing. `forbidNonWhitelisted: true` answers 400 instead.
- Without `transform: true`, `@Query('page') page: number` is still the string `"2"` at run time: TypeScript types don't convert anything.
- `ValidationPipe({ transform: true })` turns the body into a DTO instance and converts primitive path/query params to their declared types.
- Arrays of DTOs: `new ParseArrayPipe({ items: CreateNoteDto })`.
