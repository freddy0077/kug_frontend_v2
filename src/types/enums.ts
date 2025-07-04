export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  HANDLER = 'HANDLER',
  CLUB = 'CLUB',
  VIEWER = 'VIEWER'
}

export enum DogSortField {
  NAME = 'NAME',
  BREED = 'BREED',
  DATE_OF_BIRTH = 'DATE_OF_BIRTH',
  REGISTRATION_NUMBER = 'REGISTRATION_NUMBER',
  CREATED_AT = 'CREATED_AT'
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export enum DogRole {
  SIRE = 'SIRE',
  DAM = 'DAM',
  BOTH = 'BOTH'
}

export enum BreedGroupEnum {
  SPORTING = 'SPORTING',
  HOUND = 'HOUND',
  WORKING = 'WORKING',
  TERRIER = 'TERRIER',
  TOY = 'TOY',
  NON_SPORTING = 'NON_SPORTING',
  HERDING = 'HERDING',
  MISCELLANEOUS = 'MISCELLANEOUS',
  FOUNDATION_STOCK = 'FOUNDATION_STOCK'
}
