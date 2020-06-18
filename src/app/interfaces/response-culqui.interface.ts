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

