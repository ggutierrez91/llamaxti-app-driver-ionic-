export interface ItokenCulqui {
    object: string;
    id: string;
    type: string;
    email: string;
    creation_date: number;
    card_number: string;
    last_four: string;
    active: boolean;
    iin: Iin;
    client: Client;
    metadata: Metadata;
}

interface Metadata {
    dni: string;
}

interface Client {
    ip: string;
    ip_country: string;
    ip_country_code: string;
    browser?: string;
    device_fingerprint?: string;
    device_type?: string;
}

interface Iin {
    object: string;
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: Issuer;
    installments_allowed: number[];
}

interface Issuer {
    name: string;
    country: string;
    country_code: string;
    website?: string;
    phone_number?: string;
}

export interface IClientCulqui {
    object: string;
    id: string;
    creation_date: number;
    email: string;
    antifraud_details: Antifrauddetails;
    metadata?: any;
  }

interface Antifrauddetails {
    country_code: string;
    first_name: string;
    last_name: string;
    address_city: string;
    address: string;
    phone: string;
    email?: string;
    object: string;
}

export interface ICardCulqui {
    object: string;
    id: string;
    date: number;
    customer_id: string;
    source: Source;
    metadata?: any;
  }

interface Source {
    object: string;
    id: string;
    type: string;
    creation_date: number;
    card_number: string;
    last_four: string;
    active: boolean;
    iin: Iin;
    client: Client;
}

interface Iin {
    object: string;
    bin: string;
    card_brand: string;
    card_type: string;
    card_category: string;
    issuer: Issuer;
    installments_allowed: number[];
}

export interface ICargeCulqui {
  duplicated: boolean;
  object: string;
  id: string;
  amount: number;
  amount_refunded: number;
  current_amount: number;
  installments: number;
  installments_amount?: any;
  currency: string;
  email?: any;
  description?: any;
  source: Source;
  fraud_score?: any;
  antifraud_details: Antifrauddetails;
  date: number;
  reference_code: string;
  fee?: any;
  fee_details: Feedetail[];
  net_amount: number;
  response_code: string;
  merchant_message: string;
  user_message: string;
  device_ip: string;
  device_country?: any;
  country_ip?: any;
  product: string;
  state: string;
  metadata?: any;
}

interface Feedetail {
  type: string;
  amount: number;
  taxes: number;
  total_amount: number;
  currency_code: string;
  object: string;
}


interface Source {
  object: string;
  id: string;
  type: string;
  creation_date: number;
  card_number: string;
  last_four: string;
  active: boolean;
  iin: Iin;
  client: Client;
}


interface Iin {
  object: string;
  bin: string;
  card_brand: string;
  card_type: string;
  card_category: string;
  issuer: Issuer;
  installments_allowed: number[];
}


// interfaces para el almacenamiento de tarjetas culqui
export interface ICard {
    // tslint:disable-next-line: variable-name
    card_number: string;
    cvv: string;
    // tslint:disable-next-line: variable-name
    expiration_month: string;
    // tslint:disable-next-line: variable-name
    expiration_year: string;
    email: string;
    cardAll: string;
    expiration: string;

    token: string;

    card_brand: string;
    card_type: string;
    card_category: string;
    card_last_foru: string;
    bank: string;

    pkUser: number;

}


export interface ClientCulquiModel {

    // tslint:disable-next-line: variable-name
    first_name: string;
    // tslint:disable-next-line: variable-name
    last_name: string;
    email: string;
    address: string;
    // tslint:disable-next-line: variable-name
    address_city: string;
    // tslint:disable-next-line: variable-name
    country_code: string;
    // tslint:disable-next-line: variable-name
    phone_number: string;

}

export interface CardCulquiModel {
    // tslint:disable-next-line: variable-name
    customer_id: string;
    // tslint:disable-next-line: variable-name
    token_id: string;

}
