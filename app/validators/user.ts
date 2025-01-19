import { schema, rules } from '@adonisjs/validator'

export class CreateUserValidator {
  public schema = schema.create({
    email: schema.string({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string({}, [rules.minLength(8)]),
    firstName: schema.string({}, [rules.alpha()]),
    lastName: schema.string({}, [rules.alpha()]),
    status: schema.enum.optional(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    role: schema.enum(['ADMIN', 'USER', 'MODERATOR']),
    organizationId: schema.number.optional([rules.exists({ table: 'organizations', column: 'id' })]),
  })

  public messages = {
    'email.required': 'L’adresse e-mail est obligatoire',
    'email.email': 'Veuillez fournir une adresse e-mail valide',
    'email.unique': 'Cette adresse e-mail est déjà utilisée',
    'password.required': 'Le mot de passe est obligatoire',
    'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères',
    'firstName.required': 'Le prénom est obligatoire',
    'firstName.alpha': 'Le prénom ne doit contenir que des lettres',
    'lastName.required': 'Le nom est obligatoire',
    'lastName.alpha': 'Le nom ne doit contenir que des lettres',
    'status.enum': 'Le statut doit être ACTIVE, INACTIVE ou SUSPENDED',
    'role.enum': 'Le rôle doit être ADMIN, USER ou MODERATOR',
    'organizationId.exists': "L'organisation spécifiée n'existe pas",
  }
}

export class UpdateUserValidator {
  public schema = schema.create({
    email: schema.string.optional({}, [
      rules.email(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    password: schema.string.optional({}, [rules.minLength(8)]),
    firstName: schema.string.optional({}, [rules.alpha()]),
    lastName: schema.string.optional({}, [rules.alpha()]),
    status: schema.enum.optional(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
    role: schema.enum.optional(['ADMIN', 'USER', 'MODERATOR']),
    organizationId: schema.number.optional([rules.exists({ table: 'organizations', column: 'id' })]),
  })

  public messages = {
    'email.email': 'Veuillez fournir une adresse e-mail valide',
    'email.unique': 'Cette adresse e-mail est déjà utilisée',
    'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères',
    'firstName.alpha': 'Le prénom ne doit contenir que des lettres',
    'lastName.alpha': 'Le nom ne doit contenir que des lettres',
    'status.enum': 'Le statut doit être ACTIVE, INACTIVE ou SUSPENDED',
    'role.enum': 'Le rôle doit être ADMIN, USER ou MODERATOR',
    'organizationId.exists': "L'organisation spécifiée n'existe pas",
  }
}

export class LoginValidator {
  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    password: schema.string({}, [rules.minLength(8)]),
  })

  public messages = {
    'email.required': 'L’adresse e-mail est obligatoire',
    'email.email': 'Veuillez fournir une adresse e-mail valide',
    'password.required': 'Le mot de passe est obligatoire',
    'password.minLength': 'Le mot de passe doit contenir au moins 8 caractères',
  }
}
